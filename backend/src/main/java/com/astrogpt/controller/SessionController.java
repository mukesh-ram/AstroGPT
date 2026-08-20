package com.astrogpt.controller;

import com.astrogpt.model.ChatMessage;
import com.astrogpt.model.NatalChart;
import com.astrogpt.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    private final FirestoreService firestoreService;

    public SessionController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/save")
    public ResponseEntity<Void> save(@RequestBody SessionSaveRequest request) {
        firestoreService.saveChart(request.sessionId(), request.chart());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<NatalChart> getChart(@PathVariable String sessionId) {
        return firestoreService.loadChart(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String sessionId) {
        List<ChatMessage> messages = firestoreService.loadMessages(sessionId, 50);
        return ResponseEntity.ok(messages);
    }

    public record SessionSaveRequest(String sessionId, NatalChart chart) {}
}
