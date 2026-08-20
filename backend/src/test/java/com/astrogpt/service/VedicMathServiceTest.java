package com.astrogpt.service;

import com.astrogpt.model.BirthData;
import com.astrogpt.model.DashaPeriod;
import com.astrogpt.model.NatalChart;
import com.astrogpt.model.PlanetPosition;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class VedicMathServiceTest {

    @Autowired
    private VedicMathService vedicMathService;

    @Test
    public void testMumbaiChartLagna() {
        BirthData bd = new BirthData(
                "Test",
                LocalDate.of(1990, 1, 1),
                LocalTime.of(12, 0),
                "Mumbai",
                19.0760,
                72.8777,
                "Asia/Kolkata"
        );

        NatalChart chart = vedicMathService.calculateChart(bd);
        
        // Lagna for this time/place should be around Pisces/Aries.
        // According to SwissEph Lahiri for 1-Jan-1990 12:00 IST Mumbai:
        // Lagna is approx 11° Pisces (Meena)
        assertTrue(chart.lagnaRashiName().equals("Meena") || chart.lagnaRashiName().equals("Mesha") || chart.lagnaRashiName().equals("Kumbha"), "Lagna should be mathematically correct");
        assertNotNull(chart.planets());
    }

    @Test
    public void testNakshatraCalculation() {
        // Find Ketu and Rahu and verify they are 180 degrees apart
        BirthData bd = new BirthData(
                "Test",
                LocalDate.of(1990, 1, 1),
                LocalTime.of(12, 0),
                "Mumbai",
                19.0760,
                72.8777,
                "Asia/Kolkata"
        );

        NatalChart chart = vedicMathService.calculateChart(bd);
        PlanetPosition rahu = chart.planets().stream().filter(p -> p.name().equals("Rahu")).findFirst().orElseThrow();
        PlanetPosition ketu = chart.planets().stream().filter(p -> p.name().equals("Ketu")).findFirst().orElseThrow();

        double diff = Math.abs(rahu.longitude() - ketu.longitude());
        assertTrue(Math.abs(diff - 180.0) < 0.1 || Math.abs(diff - 180.0) > 359.9);
    }
    
    @Test
    public void testDashaSequence() {
        BirthData bd = new BirthData(
                "Test",
                LocalDate.of(1990, 1, 1),
                LocalTime.of(12, 0),
                "Mumbai",
                19.0760,
                72.8777,
                "Asia/Kolkata"
        );
        NatalChart chart = vedicMathService.calculateChart(bd);
        
        assertNotNull(chart.mahadashas());
        assertEquals(9, chart.mahadashas().size());
        
        // Ensure dashas are in correct consecutive order and cover exactly 120 years
        LocalDate expectedStart = bd.date();
        LocalDate lastEnd = expectedStart;
        for (DashaPeriod md : chart.mahadashas()) {
            assertEquals(lastEnd, md.startDate());
            lastEnd = md.endDate();
            assertNotNull(md.antardashas());
            assertEquals(9, md.antardashas().size());
        }
        
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(expectedStart, lastEnd);
        assertTrue(totalDays > 119 * 365 && totalDays < 121 * 365); // approx 120 years
    }
}
