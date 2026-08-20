package com.astrogpt.controller;

import com.astrogpt.model.ChatRequest;
import com.astrogpt.service.LLMPipelineService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final LLMPipelineService llmPipelineService;

    public ChatController(LLMPipelineService llmPipelineService) {
        this.llmPipelineService = llmPipelineService;
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> stream(@RequestBody ChatRequest request) {
        return llmPipelineService.streamResponse(request)
                .map(content -> ServerSentEvent.<String>builder()
                        .event("token")
                        .data(content)
                        .build())
                .concatWith(Flux.just(ServerSentEvent.<String>builder()
                        .event("done")
                        .data("[DONE]")
                        .build()))
                .onErrorResume(e -> Flux.just(ServerSentEvent.<String>builder()
                        .event("error")
                        .data(e.getMessage())
                        .build()));
    }
}
