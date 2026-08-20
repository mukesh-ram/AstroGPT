package com.astrogpt.controller;

import com.astrogpt.model.BirthData;
import com.astrogpt.model.NatalChart;
import com.astrogpt.service.VedicMathService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chart")
public class EphemerisController {

    private final VedicMathService vedicMathService;

    public EphemerisController(VedicMathService vedicMathService) {
        this.vedicMathService = vedicMathService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<NatalChart> calculate(@Valid @RequestBody BirthData birthData) {
        NatalChart chart = vedicMathService.calculateChart(birthData);
        return ResponseEntity.ok(chart);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
