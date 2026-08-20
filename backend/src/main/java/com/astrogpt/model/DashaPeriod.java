package com.astrogpt.model;

import java.time.LocalDate;
import java.util.List;

public record DashaPeriod(
    String lord,
    LocalDate startDate,
    LocalDate endDate,
    List<DashaPeriod> antardashas
) {}
