package project.final_project.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChatbotService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatbotReply(String userId, String message) {
        // ✅ FastAPI 서버 주소
        String fastapiUrl = "http://127.0.0.1:8001/chatbot/answer";

        // 요청 본문 생성
        Map<String, Object> reqBody = new HashMap<>();
        reqBody.put("user_id", userId);
        reqBody.put("message", message);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(reqBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(fastapiUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object replyObj = response.getBody().get("reply");
                return replyObj != null ? replyObj.toString() : "서버 응답이 비어 있습니다.";
            } else {
                return "FastAPI 서버로부터 유효한 응답을 받지 못했습니다.";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ FastAPI 서버 호출 실패: " + e.getMessage();
        }
    }
}
