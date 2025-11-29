package project.final_project.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import project.final_project.dto.CompareRequest;
import project.final_project.service.CompareService;

@RestController
@RequestMapping("/api")
public class CompareController {


     private final CompareService service; // ← 필드를 선언!

    public CompareController(CompareService service) {
        this.service = service;
    }

    @PostMapping("/compare")
    public Object compare(@RequestBody CompareRequest req) {
        return service.callFastApi(req);
    }
}


