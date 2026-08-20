package com.astrogpt.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record BirthData(
    @NotBlank String name,
    @NotNull LocalDate date,
    @NotNull LocalTime time,
    @NotBlank String city,
    double latitude,
    double longitude,
    @NotBlank String timezone
) {}
