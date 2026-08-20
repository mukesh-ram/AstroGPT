package com.astrogpt.service;

import com.astrogpt.model.GeocodingResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.JdkClientHttpConnector;
import reactor.core.publisher.Mono;
import java.util.Collections;
import java.util.List;

@Service
public class GeocodingService {

    private final WebClient webClient;

    public GeocodingService(@Value("${app.geocoding.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .clientConnector(new JdkClientHttpConnector())
                .baseUrl(baseUrl)
                .build();
    }

    public Mono<List<GeocodingResult>> searchCity(String city) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/search")
                        .queryParam("name", city)
                        .queryParam("count", 5)
                        .queryParam("language", "en")
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .bodyToMono(GeocodingResponse.class)
                .map(response -> response.results() != null ? response.results() : Collections.emptyList());
    }

    private record GeocodingResponse(List<GeocodingResult> results) {}
}
