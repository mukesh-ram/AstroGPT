package com.astrogpt.service;

import com.astrogpt.model.ChatMessage;
import com.astrogpt.model.NatalChart;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FirestoreService {

    private final Firestore firestore;
    private final ObjectMapper objectMapper;

    public FirestoreService(@Autowired(required = false) Firestore firestore) {
        this.firestore = firestore;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    public void saveChart(String sessionId, NatalChart chart) {
        if (firestore == null) return;
        try {
            Map<String, Object> chartData = objectMapper.convertValue(chart, Map.class);
            firestore.collection("sessions").document(sessionId).collection("charts").document("primary").set(chartData);
        } catch (Exception e) {
            // Log error
        }
    }

    public Optional<NatalChart> loadChart(String sessionId) {
        if (firestore == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection("sessions").document(sessionId).collection("charts").document("primary").get().get();
            if (snapshot.exists()) {
                NatalChart chart = objectMapper.convertValue(snapshot.getData(), NatalChart.class);
                return Optional.of(chart);
            }
        } catch (Exception e) {
            // Log error
        }
        return Optional.empty();
    }

    public void saveMessage(String sessionId, ChatMessage msg) {
        if (firestore == null) return;
        try {
            Map<String, Object> msgData = objectMapper.convertValue(msg, Map.class);
            firestore.collection("sessions").document(sessionId).collection("messages").add(msgData);
        } catch (Exception e) {
            // Log error
        }
    }

    public List<ChatMessage> loadMessages(String sessionId, int limit) {
        if (firestore == null) return Collections.emptyList();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection("sessions")
                    .document(sessionId)
                    .collection("messages")
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .limit(limit)
                    .get();
            
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<ChatMessage> messages = documents.stream()
                    .map(doc -> objectMapper.convertValue(doc.getData(), ChatMessage.class))
                    .collect(Collectors.toList());
            Collections.reverse(messages); // Return in chronological order
            return messages;
        } catch (Exception e) {
            // Log error
            return Collections.emptyList();
        }
    }
}
