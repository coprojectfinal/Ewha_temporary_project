package project.final_project.controller;

import org.springframework.web.bind.annotation.*;

import project.final_project.service.ChatbotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> askChatbot(@RequestBody Map<String, Object> payload) {
        String userId = payload.get("user_id").toString();
        String message = payload.get("message").toString();

        try {
            String reply = chatbotService.getChatbotReply(userId, message);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Chatbot 서버 처리 중 오류: " + e.getMessage()));
        }
    }
}
