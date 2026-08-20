package com.astrogpt.model;

import java.time.LocalDateTime;

public record ChatMessage(
    String role,
    String content,
    LocalDateTime timestamp
) {}
