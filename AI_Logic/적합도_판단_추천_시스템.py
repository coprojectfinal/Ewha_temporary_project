# -*- coding: utf-8 -*-
"""
적합도 판단 + 추천 시스템 (FastAPI + OpenAI + MySQL)
"""

import os
import math
import json
import logging
import pandas as pd
import numpy as np
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# =====================================================
# 🔹 로깅 설정
# =====================================================
os.makedirs("logs", exist_ok=True)
logger = logging.getLogger("ai_server")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)

# =====================================================
# 🔹 FastAPI 초기화
# =====================================================
app = FastAPI(title="적합도 판단 + 추천 시스템 API")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 🔹 OpenAI API Key
# =====================================================
client = OpenAI(
    api_key="OPENAI_API_KEY"
)

# =====================================================
# 🔹 RDS 연결
# =====================================================
RDS_HOST = "RDS_HOST"
RDS_USER = "RDS_USER"
RDS_PW = "RDS_PW"

# =====================================================
# 🔹 요청 데이터 구조
# =====================================================
class RequestBody(BaseModel):
    user_id: str
    product_name: str


# =====================================================
# 🔹 유틸 함수
# =====================================================
def num(x):
    try:
        return float(str(x).replace(",", "").replace("mg", "").replace("g", "").replace("kcal", "").strip())
    except:
        return None


def split_list(x):
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return []
    return [t.strip() for t in str(x).replace(";", ",").split(",") if t.strip()]


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


# =====================================================
# 🔹 메인 엔드포인트
# =====================================================
@app.post("/analyze")
def analyze(body: RequestBody):
    
    user_id = body.user_id
    product_name = body.product_name
    print("📍 받은 user_id:", user_id)


    # 1️⃣ 사용자 정보 불러오기
    conn = mysql.connector.connect(host=RDS_HOST, user=RDS_USER, password=RDS_PW, database="product_db")
    user_df = pd.read_sql("SELECT user_id, allergies, medical_conditions FROM user_private WHERE user_id = %s", conn, params=[user_id])
    conn.close()
    if user_df.empty:
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")
    user_allergies = split_list(user_df.iloc[0]["allergies"])
    user_goals = split_list(user_df.iloc[0]["medical_conditions"])

    # 2️⃣ 제품 정보 불러오기
    conn = mysql.connector.connect(host=RDS_HOST, user=RDS_USER, password=RDS_PW, database="product_db")
    df = pd.read_sql("SELECT * FROM ramen_db", conn)
    conn.close()

    df.columns = [c.strip().replace(" ", "") for c in df.columns]
    for col in df.columns:
        if any(unit in col for unit in ["mg", "g", "kcal"]):
            df[col] = df[col].apply(num)
    if "개별내용량" in df.columns:
        df["개별내용량"] = df["개별내용량"].apply(num)

    row = df[df["품명"] == product_name]
    if row.empty:
        raise HTTPException(status_code=404, detail=f"'{product_name}' 제품을 찾을 수 없습니다.")
    row = row.iloc[0]

    # 3️⃣ 건강 목표 매핑
    target_map = {}
    for goal in user_goals:
        if goal in health_condition_rules:
            target_map.update(health_condition_rules[goal])
    if not target_map:
        target_map = {"칼로리": "low"}

    # 4️⃣ 알레르기 체크
    notice = str(row.get("알레르기", "")).lower()
    final = "부적합" if any(a.lower() in notice for a in user_allergies) else "적합"

    # 5️⃣ 성분 평가
    def calc_per_100(df, key):
        df_valid = df.dropna(subset=["개별내용량"])
        vals = []
        for _, r in df_valid.iterrows():
            try:
                vals.append(float(r.get(key, 0)) / float(r.get("개별내용량", 100)) * 100)
            except:
                continue
        return sum(vals) / len(vals) if vals else None

    nutrition_results = []
    for key, direction in target_map.items():
        try:
            value = float(row.get(key, 0))
            total = float(row.get("개별내용량", 100))
            per_100 = value / total * 100
        except:
            per_100 = None

        avg_value = calc_per_100(df, key)
        if value == 0 or per_100 == 0:
            status = "미함유"
        elif avg_value is None or per_100 is None:
            status = "정보부족"
        else:
            diff_ratio = per_100 / avg_value if avg_value != 0 else None
            if diff_ratio is None:
                status = "정보부족"
            elif diff_ratio > 1.1:
                status = "평균보다 높음"
            elif diff_ratio < 0.9:
                status = "평균보다 낮음"
            else:
                status = "평균과 비슷함"
        nutrition_results.append({"nutrient": key, "evaluation": status})

    # 6️⃣ 간접 알레르기
    indirect = row.get("간접알레르기", None)
    warning_text = ""
    if indirect and not (isinstance(indirect, float) and math.isnan(indirect)):
        indirect_str = str(indirect).lower()
        for a in user_allergies:
            if a.lower() in indirect_str or indirect_str in ["o", "yes", "1", "true"]:
                warning_text = f"'{a}' 간접 알레르기 주의"
                break

    # 7️⃣ AI 설명 생성
    try:
        nutrition_summary = ", ".join([f"{n['nutrient']}({n['evaluation']})" for n in nutrition_results])
        prompt = f"""
제품명: {product_name}
사용자 알레르기: {', '.join(user_allergies) if user_allergies else '없음'}
건강목표: {', '.join(user_goals) if user_goals else '없음'}
성분 평가 요약: {nutrition_summary}
최종 판정: {final}
경고 문구: {warning_text}
"""
        res = client.responses.create(model="gpt-4.1-mini", input=prompt, temperature=0.3)
        reason = res.output_text.strip()
    except Exception as e:
        logger.error(f"[AI] 오류: {e}")
        reason = "(AI 설명 생성 실패)"

    # 8️⃣ 결과 반환 (영문 key로 통일)
    return {
        "ai_description": reason,
        "nutrition_analysis": nutrition_results,
        "indirect_allergy": warning_text
    }
