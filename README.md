# 🥫 ProdCheck

개인의 건강 조건에 따라 가공식품의 적합 여부를 확인하고 대체 상품을 추천받으며, 
여러 제품을 원하는 기준으로 비교할 수 있는 웹 서비스입니다.

## 코드 구성
- AI_Logic
- backend
- frontend

## 실행 방법

**사전 준비**
- Python
- Java
- Node.js
- npm
- MySQL (AWS RDS)
- OpenAI API Key

### AI_Logic

실행 전, OpenAI API Key 및 AWS RDS 접속 정보를 환경 변수로 설정합니다.

```
cd AI_Logic

# 필요한 패키지 설치
pip install -r requirements.txt

# 실행
uvicorn suitability_and_recommendation:app --host 0.0.0.0 --port 8000
uvicorn chatbot_logic:app --host 0.0.0.0 --port 8001
uvicorn compare_products:app --host 0.0.0.0 --port 8002
```

### backend

실행 전, `application.properties` 파에서 Spring Boot 데이터소스 설정

```
spring.datasource.url=jdbc:mysql://[????]:3306/[DB??]
spring.datasource.username=[DB_USER]
spring.datasource.password=[DB_PASSWORD]
```

```
cd backend

# 빌드
./gradlew build

# 실행
./gradlew bootRun
```

### frontend
```
cd frontend

# 의존성 설치
npm install

# 실행
npm run dev
```

## 테스트 방법
