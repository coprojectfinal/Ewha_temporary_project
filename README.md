# 🥫 ProdCheck

개인의 건강 조건에 따라 가공식품의 적합 여부를 확인하고 대체 상품을 추천받으며, 
여러 제품을 원하는 기준으로 비교할 수 있는 웹 서비스입니다.

## 코드 구성
- AI_Logic
- backend
- frontend

## 설치 방법

- Python
- Java
- Node.js

### AI_Logic
```
pip install
```

### backend
```
./gradlew build
```

### frontend
```
npm install
```

## 실행 방법

### AI_Logic
```
cd AI_Logic
uvicorn suitability_and_recommendation:app --host 0.0.0.0 --port 8000
uvicorn chatbot_logic:app --host 0.0.0.0 --port 8001
uvicorn compare_products:app --host 0.0.0.0 --port 8002
```

### backend
```
cd backend
./gradlew bootRun
```

### frontend
```
cd frontend
npm run dev
```
