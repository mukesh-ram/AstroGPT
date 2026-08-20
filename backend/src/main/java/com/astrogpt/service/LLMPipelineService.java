package com.astrogpt.service;

import com.astrogpt.model.ChatMessage;
import com.astrogpt.model.ChatRequest;
import com.astrogpt.model.NatalChart;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.List;

/**
 * LLMPipelineService – formats the Vedic natal chart as a structured JSON payload,
 * injects it into a Jyotish expert system prompt, and streams responses from
 * Google Gemini via the official google-genai Java SDK v1.66.0.
 *
 * <p>Uses the {@code GOOGLE_API_KEY} environment variable (with {@code GEMINI_API_KEY}
 * as legacy fallback) to authenticate. The SDK also auto-reads {@code GOOGLE_API_KEY}
 * from the environment if the client is constructed without explicit key.</p>
 *
 * <p>Bridges the blocking {@link ResponseStream} to a reactive {@link Flux} via
 * Project Reactor's boundedElastic thread pool.</p>
 */
@Service
public class LLMPipelineService {

    private static final Logger log = LoggerFactory.getLogger(LLMPipelineService.class);
    private static final String MODEL = "gemini-3.6-flash";

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are AstroGPT — a wise, deeply knowledgeable Vedic astrology guide (Jyotish Guru).
            You have been given the precise natal chart (Kundali) of the person you are speaking with,
            calculated using the Lahiri ayanamsa with Whole Sign houses.

            Provide deep, personalised insights grounded strictly in Vedic astrology principles
            (Jyotish). Be respectful, compassionate, and specific — avoid generic statements.
            Always reference the actual planetary positions, house placements, Nakshatra, and
            Dasha periods from the chart data below.

            == NATAL CHART DATA ==
            {chartJson}

            == CURRENT DASHA ==
            Mahadasha Lord : {mahadasha}
            Antardasha Lord: {antardasha}

            Respond in a warm, conversational tone. Keep answers concise unless asked for detail.
            """;

    private final ObjectMapper objectMapper;
    private final String apiKey;

    public LLMPipelineService(
            @Value("${GOOGLE_API_KEY:}") String googleKey,
            @Value("${GEMINI_API_KEY:}") String geminiKey) {
        // GOOGLE_API_KEY is preferred; GEMINI_API_KEY is the legacy fallback
        this.apiKey = (!googleKey.isBlank()) ? googleKey : geminiKey;
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Streams a Gemini response as a reactive {@code Flux<String>} of text tokens.
     * The blocking SDK call runs on a bounded-elastic thread pool.
     */
    public Flux<String> streamResponse(ChatRequest request) {
        return Flux.<String>create(sink -> {
            try {
                String systemPrompt = buildSystemPrompt(request.chart());
                List<Content> contents = buildContents(request);

                // SDK auto-reads GOOGLE_API_KEY from env if apiKey is blank
                Client client = apiKey.isBlank()
                        ? new Client()
                        : Client.builder().apiKey(apiKey).build();

                GenerateContentConfig config = GenerateContentConfig.builder()
                        .systemInstruction(Content.fromParts(Part.fromText(systemPrompt)))
                        .temperature(0.7f)
                        .maxOutputTokens(2048)
                        .build();

                try (ResponseStream<GenerateContentResponse> stream =
                             client.models.generateContentStream(MODEL, contents, config)) {

                    for (GenerateContentResponse chunk : stream) {
                        if (sink.isCancelled()) break;
                        String text = chunk.text();
                        if (text != null && !text.isEmpty()) {
                            sink.next(text);
                        }
                    }
                }
                sink.complete();

            } catch (Exception e) {
                log.error("LLM streaming error: {}", e.getMessage());
                sink.error(e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private String buildSystemPrompt(NatalChart chart) {
        String chartJson;
        String mahadasha  = "Unknown";
        String antardasha = "Unknown";

        if (chart != null) {
            try {
                chartJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(chart);
            } catch (Exception e) {
                chartJson = "Chart serialization failed: " + e.getMessage();
            }
            mahadasha  = chart.currentMahadasha()  != null ? chart.currentMahadasha()  : "Unknown";
            antardasha = chart.currentAntardasha() != null ? chart.currentAntardasha() : "Unknown";
        } else {
            chartJson = "No chart data. Ask the user to provide their birth details.";
        }

        return SYSTEM_PROMPT_TEMPLATE
                .replace("{chartJson}",  chartJson)
                .replace("{mahadasha}",  mahadasha)
                .replace("{antardasha}", antardasha);
    }

    /**
     * Builds the multi-turn conversation history list (last 10 messages).
     */
    private List<Content> buildContents(ChatRequest request) {
        List<Content> contents = new ArrayList<>();

        List<ChatMessage> history = request.history();
        if (history != null) {
            int start = Math.max(0, history.size() - 10);
            for (ChatMessage msg : history.subList(start, history.size())) {
                String role = "user".equals(msg.role()) ? "user" : "model";
                contents.add(Content.fromParts(Part.fromText(msg.content()))
                        .toBuilder().role(role).build());
            }
        }

        // Current user message
        contents.add(Content.fromParts(Part.fromText(request.message()))
                .toBuilder().role("user").build());

        return contents;
    }
}
