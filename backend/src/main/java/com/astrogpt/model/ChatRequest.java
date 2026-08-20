package com.astrogpt.model;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChatRequest(
    @NotBlank String sessionId,
    @NotBlank String message,
    NatalChart chart,
    List<ChatMessage> history
) {}
