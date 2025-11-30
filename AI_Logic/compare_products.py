from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import pandas as pd
import json
from openai import OpenAI
from typing import List, Dict, Any # 필요한 타입 힌트 추가
import traceback # 오류 로그 출력을 위해 추가

# ---------------------------------------------------------
# 0️⃣ 기본 설정
# ---------------------------------------------------------
# 🚨 실제 RDS 정보로 대체 필요
RDS_HOST = "RDS_HOST"
RDS_USER = "RDS_USER"
RDS_PW   = "RDS_PW"
RDS_DB   = "product_db"

# 🚨 실제 API 키로 대체 필요
client = OpenAI(api_key="OPENAI_API_KEY")

RDS_CFG = {
    "host": RDS_HOST,
    "user": RDS_USER,
    "password": RDS_PW,
    "database": RDS_DB
}

app = FastAPI(title="compare_products")

# 💡 CORS 미들웨어 추가 (403 오류 방지)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# 1️⃣ 소속 제품군 찾기
# ---------------------------------------------------------
def get_category_table(product_name: str):
    conn = None
    try:
        conn = mysql.connector.connect(**RDS_CFG)
        query = "SELECT 소속제품군 FROM table_info WHERE 품명 = %s LIMIT 1"
        df = pd.read_sql(query, conn, params=[product_name])
        
        if df.empty:
            raise ValueError(f"'{product_name}'의 소속 제품군을 찾을 수 없습니다. (DB에 품명 없음)")
        return df.iloc[0]["소속제품군"]
    except Exception as e:
        raise ConnectionError(f"DB 접근 오류 (get_category_table): {e}") 
    finally:
        if conn:
            conn.close()

# ---------------------------------------------------------
# 2️⃣ nutrients_stats에서 평균/표준편차 불러오기
# ---------------------------------------------------------
def get_stats_from_rds(category_table: str, nutrient_list: list):
    conn = None
    try:
        conn = mysql.connector.connect(**RDS_CFG)
        placeholders = ','.join(['%s'] * len(nutrient_list))
        query = f"""
            SELECT 영양성분, 평균, 표준편차
            FROM nutrients_stats
            WHERE 제품군 = %s AND 영양성분 IN ({placeholders})
        """
        params = [category_table] + nutrient_list
        df = pd.read_sql(query, conn, params=params)
        
        stats = df.set_index("영양성분").to_dict(orient="index")
        for k, v in stats.items():
            if v.get("표준편차", 0) <= 0:
                stats[k]["표준편차"] = 1e-9
        return stats
    except Exception as e:
        raise ConnectionError(f"DB 접근 오류 (get_stats_from_rds): {e}")
    finally:
        if conn:
            conn.close()

# ---------------------------------------------------------
# 3️⃣ 실제 상품 영양성분 불러오기
# ---------------------------------------------------------
def get_selected_products(category_table: str, product_list: list, nutrient_list: list):
    conn = None
    try:
        conn = mysql.connector.connect(**RDS_CFG)
        cols = ["품명"] + nutrient_list
        placeholders = ','.join(['%s'] * len(product_list))
        query = f"SELECT {', '.join(cols)} FROM {category_table} WHERE 품명 IN ({placeholders})"
        df = pd.read_sql(query, conn, params=product_list)
        return df
    except Exception as e:
        raise ConnectionError(f"DB 접근 오류 (get_selected_products): {e}")
    finally:
        if conn:
            conn.close()

# ---------------------------------------------------------
# 4️⃣ FastAPI 엔드포인트
# ---------------------------------------------------------
@app.post("/api/compare_products") # 💡 프론트엔드에 맞게 경로 수정
async def compare_products(request: Request):
    
    # 💡 변수 초기화 (NameError 방지)
    ai_summary = "AI 설명을 생성하는 데 문제가 발생했습니다." 
    summary_payload = []
    user_standard = {}
    category_table = "알 수 없음"

    try:
        data = await request.json()
        selected_products: List[str] = data.get("selected_products", [])
        user_standard: Dict[str, Any] = data.get("user_standard", {})
        
        # 💡 NoneType 오류 방어
        if user_standard is None:
            user_standard = {}
        
        nutrient_list = list(user_standard.keys())

        if not selected_products or not user_standard:
            return {"error": "상품 목록과 기준이 필요합니다."}

        # 1. 소속 제품군 확인
        category_table = get_category_table(selected_products[0])

        # 2. 통계 불러오기
        stats = get_stats_from_rds(category_table, nutrient_list)
        
        # 3. 상품 데이터 불러오기
        df_sel = get_selected_products(category_table, selected_products, nutrient_list)
        
        if df_sel.empty:
            return {"error": "선택한 상품의 DB 정보를 찾을 수 없습니다."}
            
        df_sel[nutrient_list] = df_sel[nutrient_list].apply(pd.to_numeric, errors="coerce").fillna(0.0)

        # 4. Z-score 계산 + 방향성 반영
        n_criteria = len(user_standard)
        
        for c, direction in user_standard.items():
            mean, std = stats[c]["평균"], stats[c]["표준편차"]
            df_sel[f"z_{c}"] = (df_sel[c] - mean) / std
            df_sel[f"{c}_score"] = -df_sel[f"z_{c}"] if direction == "낮게" else df_sel[f"z_{c}"]

            df_sel[f"{c}_score_100"] = ((df_sel[f"{c}_score"].clip(-10, 10) + 10) / 20) * 100
            df_sel[f"{c}_score"] = df_sel[f"{c}_score_100"].round(1)
        
            df_sel[f"{c}_weighted_score"] = df_sel[f"{c}_score"] * (1 / n_criteria)

        # 5. 총점 계산
        weighted_cols = [f"{c}_weighted_score" for c in nutrient_list]
        df_sel["final_score_100"] = df_sel[weighted_cols].sum(axis=1).round(1)
        df_ranked = df_sel.sort_values("final_score_100", ascending=False).reset_index(drop=True)

        # 6. AI 설명 생성
        comparison_table = df_ranked[
            ["품명"] + nutrient_list +
            [f"{c}_weighted_score" for c in nutrient_list] +
            ["final_score_100"]
        ].round(3)

        summary_payload = comparison_table.to_dict(orient="records")

        # ... (AI 프롬프트 생성 로직 생략) ...
        prompt = f"""
        사용자의 건강 기준: {json.dumps(user_standard, ensure_ascii=False)}

        아래는 {category_table} 제품군 내 선택된 상품의 영양성분 비교입니다:
        {json.dumps(summary_payload, ensure_ascii=False)}

        이 정보를 바탕으로:
        1. 계산 결과값을 바탕으로 어떤 제품이 기준에 가장 부합하는지,
        2. 각 제품의 평균값과 표준편차값을 참고하여 사용자가 기준으로 선택한 영양성분의 정도를 자세히 비교해주고,
        3. 그래서 어떤 제품을 추천하는지
        4. z점수는 언급하지 말고, ~합니다, ~다 같은 전문적인 말투를 이용해서, 3문장 이내로
        문장과 문장이 자연스럽게 이어지게끔 한국어로 설명하는 문장을 출력해줘.
        """
        
        # 💡 AI 호출 별도 try-except 블록 (성공 여부와 관계없이 최종 결과 반환 보장)
        try:
            response = client.responses.create(model="gpt-4.1-mini", input=prompt)
            ai_summary = response.output_text.strip()
        except Exception as e:
            print("⚠️ OpenAI 오류:", e)
            ai_summary = "(AI 설명 생성 실패)"

        # 7. 성공적인 경우, 최종 결과 반환
        return {
            "category_table": category_table,
            "comparison_table": summary_payload,
            "stats_used": stats,
            "user_standard": user_standard,
            "ai_summary": ai_summary
        }

    except Exception as e:
        # 💡 최외곽 오류 핸들링: DB 오류, 데이터 오류 등 모든 치명적인 오류 포착
        import traceback
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"⚠️ FastAPI 처리 오류 발생: {type(e).__name__}")
        traceback.print_exc()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        
        return {"error": f"서버 처리 중 치명적인 오류 발생: {type(e).__name__}. 상세 로그를 확인하세요."}
