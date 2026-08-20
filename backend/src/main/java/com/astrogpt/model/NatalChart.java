package com.astrogpt.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record NatalChart(
    String name,
    LocalDate birthDate,
    LocalTime birthTime,
    String city,
    double latitude,
    double longitude,
    String timezone,
    double julianDay,
    int lagnaRashi,
    String lagnaRashiName,
    double lagnaLongitude,
    String moonNakshatra,
    int moonNakshatraIndex,
    int moonNakshatraPada,
    List<PlanetPosition> planets,
    List<DashaPeriod> mahadashas,
    String currentMahadasha,
    String currentAntardasha,
    LocalDateTime calculatedAt
) {}
