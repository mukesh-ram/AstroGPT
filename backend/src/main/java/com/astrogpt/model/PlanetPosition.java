package com.astrogpt.model;

public record PlanetPosition(
    String name,
    double longitude,
    int rashiIndex,
    String rashiName,
    double degreeInRashi,
    int nakshatraIndex,
    String nakshatraName,
    int pada,
    boolean retrograde,
    int houseNumber
) {}
