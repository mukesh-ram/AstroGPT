package com.astrogpt.model;

public record GeocodingResult(
    String name,
    String country,
    double latitude,
    double longitude,
    String timezone
) {}
