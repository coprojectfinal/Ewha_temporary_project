# 🥫 ProdCheck

개인의 건강 조건에 따라 가공식품의 적합 여부를 확인하고 대체 상품을 추천받으며, 
여러 제품을 원하는 기준으로 비교할 수 있는 웹 서비스입니다.


## 코드 구성

| AI_Logic | FastAPI 기반 (Python) |
| Backend  | Spring Boot 기반 (Java) |
| Frontend | React 기반 (JavaScript) |

## 실행 방법

**사전 준비**
- Python
- Java
- Node.js
- npm
- MySQL (AWS RDS)
- OpenAI API Key

**샘플 데이터**

**실행 전 설정**

AI_Logic의 `.env.example` 파일을 기준으로 `.env` 파일을 생성하고, 환경 변수를 설정

```
OPENAI_API_KEY=

DB_HOST=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

backend/src/main/resources의 `application-example.properties` 파일을 기준으로 
`application.properties` 파일을 생성하고, Spring Boot 데이터소스를 설정

```
spring.datasource.url=jdbc:mysql://[????]:3306/[DB??]
spring.datasource.username=[DB_USER]
spring.datasource.password=[DB_PASSWORD]
```

### AI_Logic

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

1. 홈 화면 하단 내비게이션에서 '마이페이지' 클릭
2. 회원가입 후 로그인
3. 홈 화면에서 확인하고자 하는 가공식품 검색
4. 클릭하여 영양 정보 확인 후 하단의 '적합성 판단하기' 버튼 클릭
5. 적합성 판단 결과 확인 후 모달 창을 닫고 우측 상단 홈 아이콘 클릭
6. 하단 내비게이션의 '상품 비교' 클릭
7. 검색을 통해 비교하고자 하는 상품들을 선택 (2개 이상 5개 이하)
8. 비교하고 싶은 성분과 기준 선택
9. 비교 결과 확인 후 홈 아이콘 클릭
10. 홈 화면 우측 하단의 채팅 아이콘 클릭
