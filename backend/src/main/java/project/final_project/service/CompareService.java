package project.final_project.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import project.final_project.dto.CompareRequest;

@Service
public class CompareService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Object callFastApi(CompareRequest request) {

        String url = "http://127.0.0.1:8002/compare_products";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // ⭐ FastAPI가 원하는 snake_case JSON 조립
        Map<String, Object> fastApiPayload = new HashMap<>();
        fastApiPayload.put("selected_products", request.getSelectedProducts());
        fastApiPayload.put("user_standard", request.getUserStandard());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(fastApiPayload, headers);

        try {
            ResponseEntity<Object> response =
                    restTemplate.postForEntity(url, entity, Object.class);

            return response.getBody();

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "FastAPI 호출 중 오류 발생: " + e.getMessage());
            return error;
        }
    }
}

