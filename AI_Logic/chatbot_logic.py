# -*- coding: utf-8 -*-
"""
사용자 맞춤형 Q&A 챗봇 (FastAPI)
- DB 기반 실시간 제품 추천
- 사용자 알레르기 및 건강목표 반영
- OpenAI GPT 전문 상담 어조 응답 생성
"""

import os
import re
import pandas as pd
import mysql.connector
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# ---------------------------------------------------------
# 🔹 환경 설정
# ---------------------------------------------------------
RDS_HOST = "RDS_HOST"
RDS_USER = "RDS_USER"
RDS_PW   = "RDS_PW"

client = OpenAI(api_key="OPENAI_API_KEY")

app = FastAPI(title="chatbot_logic")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 🔹 제품군 자동 탐지
# ---------------------------------------------------------
def detect_category(message: str):
    category_map = {
        "라면": "ramen_db","시리얼": "cereal_db","아이스크림": "icecream_db", 
        "과자": "snack_cookie_pie_db","스낵": "snack_cookie_pie_db","쿠키": "snack_cookie_pie_db",
        "과채음료": "fruitdrink_db","과일음료수": "fruitdrink_db","과일음료": "fruitdrink_db",
        "만두": "mandoo_donkatsu_chicken_fry_db","돈까스": "mandoo_donkatsu_chicken_fry_db",
        "치킨": "mandoo_donkatsu_chicken_fry_db","볶음밥": "friedrice_soup_db",
        "죽": "friedrice_soup_db","스프": "friedrice_soup_db","국": "friedrice_soup_db",
    }
    for keyword, table in category_map.items():
        if keyword in message:
            return table
    return "ramen_db"  # 기본값

# ---------------------------------------------------------
# 🔹 주요 성분 키워드 탐지
# ---------------------------------------------------------
def detect_focus_nutrient(message: str):
    for nutrient in ["나트륨","당류","지방","포화지방","트랜스지방","탄수화물","단백질","칼로리"]:
        if nutrient in message:
            return nutrient
    return None

# ---------------------------------------------------------
# 🔹 FastAPI 엔드포인트
# ---------------------------------------------------------
@app.post("/chatbot/answer")
async def chatbot_answer(request: Request):
    """
    Spring 서버에서 /api/chatbot/ask 로 요청:
    {
        "user_id": "1",
        "message": "나트륨이 적은 라면 추천해줘"
    }
    """
    data = await request.json()
    user_id = data.get("user_id")
    message = data.get("message", "")

    # ✅ 1️⃣ 사용자 정보 불러오기
    try:
        conn = mysql.connector.connect(
            host=RDS_HOST, user=RDS_USER, password=RDS_PW, database="product_db"
        )
        query = "SELECT user_id, allergies, medical_conditions FROM user_private WHERE user_id = %s"
        user_df = pd.read_sql(query, conn, params=[user_id])
        conn.close()
    except Exception as e:
        return {"reply": f"⚠️ 사용자 DB 접근 실패: {e}"}

    if user_df.empty:
        return {"reply": "사용자 정보를 찾을 수 없습니다."}

    user_allergies = re.split(r"[;,,\s]+", str(user_df.iloc[0]["allergies"] or "없음"))
    user_conditions = re.split(r"[;,,\s]+", str(user_df.iloc[0]["medical_conditions"] or "없음"))

    # ✅ 2️⃣ 제품군 / 주요 성분 탐지
    category_table = detect_category(message)
    focus = detect_focus_nutrient(message)

    # ✅ 3️⃣ 제품 데이터 로드
    try:
        conn = mysql.connector.connect(
            host=RDS_HOST, user=RDS_USER, password=RDS_PW, database="product_db"
        )
        df = pd.read_sql(f"SELECT * FROM {category_table}", conn)
        conn.close()
    except Exception as e:
        return {"reply": f"⚠️ 제품 DB 접근 실패: {e}"}

    # ✅ 4️⃣ 알레르기 포함 제품 제외
    allergy_pattern = "|".join([a for a in user_allergies if a and a != "없음"])
    if allergy_pattern:
        df = df[~df["알레르기"].str.contains(allergy_pattern, case=False, na=False)]

    # ✅ 5️⃣ 건강목표 기반 방향성 설정
    health_condition_rules = {
        "고혈압": {"나트륨": "low"},
        "당뇨": {"당류": "low"},
        "감량": {"칼로리": "low"},
        "고지혈증": {"지방": "low", "포화지방": "low", "트랜스지방": "low"},
        "심혈관질환": {"나트륨": "low", "포화지방": "low", "콜레스테롤": "low"},
        "신장질환": {"나트륨": "low", "단백질": "low"},
        "간질환": {"당류": "low", "지방": "low"},
        "골다공증": {"칼슘": "high", "나트륨": "low"},
        "고콜레스테롤혈증": {"콜레스테롤": "low", "포화지방": "low"},
        "통풍": {"단백질": "low"},
    }
    priority_cols = {}

    # 사용자 건강목표에 해당하는 모든 성분·방향 모으기
    for goal in user_conditions:
        for condition, rule_map in health_condition_rules.items():
            if condition in goal:
                priority_cols.update(rule_map)

    # 기준 성분이 없으면 기본값으로 나트륨을 사용
    if not priority_cols:
        priority_cols = {"나트륨": "low"}

    # 우선순위 성분별로 필터링 및 정렬
    selected_col = list(priority_cols.keys())[0]
    direction = priority_cols[selected_col]

    if selected_col in df.columns:
        df = df.dropna(subset=[selected_col])
        df[selected_col] = pd.to_numeric(df[selected_col], errors="coerce")
        df = df.sort_values(by=selected_col, ascending=(direction == "low"))
        top_products = df.head(5)
    else:
        top_products = df.sample(min(5, len(df)))

    # ✅ 6️⃣ AI 프롬프트 생성 (전문가 상담 톤)
    prompt = f"""
당신은 식품영양학 및 건강관리 분야의 전문 컨설턴트입니다.
사용자의 건강 상태, 알레르기, 제품 영양 정보를 분석하여 객관적이고 전문적인 의견을 제시하세요.
불필요한 감정 표현 없이 논리적이고 신뢰도 높은 어조를 유지하세요.

[사용자 정보]
- 알레르기: {', '.join([a for a in user_allergies if a])}
- 건강목표: {', '.join([c for c in user_conditions if c])}

[제품 데이터 예시]
{top_products.to_dict(orient="records")}

[사용자 질문]
"{message}"

위 데이터를 근거로, 답변 작성 시 유의사항:
    1. 사용자의 알레르기 및 질환 정보를 반드시 고려해, 섭취 권장/주의 여부를 명확히 제시할 것.
    2. 제품에 대한 정보가 충분하지 않다면 일반적인 건강 기준에 따라 신중한 조언을 제공할 것.
    3. 수치나 단위 대신 상대적 표현(예: 낮음, 높음, 적당함)을 사용하고, 과도한 확정적 표현(예: 반드시, 절대)은 피할 것.
    4. 문체는 공식적이고 자연스럽게 유지하며, 2~4문장 내에서 간결하게 설명할 것.
    5. 질문이 제품 외 일반 건강 문의일 경우, 사용자의 건강 정보를 기반으로 일반적인 조언을 제시할 것.
한국어로, 전문가 상담 보고서처럼 정중하고 명확한 문체를 사용하세요.
"""

    try:
        res = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            temperature=0.4
        )
        reply = res.output[0].content[0].text.strip()
    except Exception as e:
        reply = f"(AI 응답 생성 실패: {e})"

    return {"reply": reply}

