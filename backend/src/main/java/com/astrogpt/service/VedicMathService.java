package com.astrogpt.service;

import com.astrogpt.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import de.thmac.swisseph.SweConst;
import de.thmac.swisseph.SweDate;
import de.thmac.swisseph.SwissEph;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class VedicMathService {

    private SwissEph sw;

    static final String[] RASHI_NAMES = {"Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"};
    static final String[] NAKSHATRA_NAMES = {"Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"};
    static final String[] DASHA_LORDS = {"Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"};
    static final double[] DASHA_YEARS = {7,20,6,10,7,18,16,19,17};

    @PostConstruct
    public void init() {
        sw = new SwissEph();
        sw.swe_set_sid_mode(SweConst.SE_SIDM_LAHIRI, 0, 0);
    }

    public NatalChart calculateChart(BirthData bd) {
        double tjdUt = calculateJulianDay(bd.date(), bd.time(), bd.timezone());
        double lagnaLon = calculateLagna(tjdUt, bd.latitude(), bd.longitude());
        int lagnaRashi = (int) (lagnaLon / 30.0);
        
        Map<String, PlanetPosition> planetsMap = calculatePlanetPositions(tjdUt, lagnaLon);
        List<PlanetPosition> planets = new ArrayList<>(planetsMap.values());
        
        PlanetPosition moon = planetsMap.get("Moon");
        List<DashaPeriod> mahadashas = calculateVimshottariMahadashas(moon.longitude(), bd.date());
        
        String currentMahadasha = "Unknown";
        String currentAntardasha = "Unknown";
        LocalDate today = LocalDate.now();
        
        for (DashaPeriod md : mahadashas) {
            if (!today.isBefore(md.startDate()) && today.isBefore(md.endDate())) {
                currentMahadasha = md.lord();
                if (md.antardashas() != null) {
                    for (DashaPeriod ad : md.antardashas()) {
                        if (!today.isBefore(ad.startDate()) && today.isBefore(ad.endDate())) {
                            currentAntardasha = ad.lord();
                            break;
                        }
                    }
                }
                break;
            }
        }

        return new NatalChart(
            bd.name(),
            bd.date(),
            bd.time(),
            bd.city(),
            bd.latitude(),
            bd.longitude(),
            bd.timezone(),
            tjdUt,
            lagnaRashi,
            RASHI_NAMES[lagnaRashi],
            lagnaLon,
            moon.nakshatraName(),
            moon.nakshatraIndex(),
            moon.pada(),
            planets,
            mahadashas,
            currentMahadasha,
            currentAntardasha,
            LocalDateTime.now()
        );
    }

    public double calculateJulianDay(LocalDate date, LocalTime time, String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        ZonedDateTime zdt = ZonedDateTime.of(date, time, zoneId);
        ZonedDateTime utc = zdt.withZoneSameInstant(ZoneId.of("UTC"));
        
        SweDate sd = new SweDate(utc.getYear(), utc.getMonthValue(), utc.getDayOfMonth(), 
            utc.getHour() + utc.getMinute() / 60.0 + utc.getSecond() / 3600.0);
        return sd.getJulDay();
    }

    public Map<String, PlanetPosition> calculatePlanetPositions(double tjdUt, double lagnaLongitude) {
        Map<String, PlanetPosition> positions = new LinkedHashMap<>();
        int iflag = SweConst.SEFLG_SIDEREAL | SweConst.SEFLG_SPEED | SweConst.SEFLG_MOSEPH;
        
        int[] planets = {
            SweConst.SE_SUN, SweConst.SE_MOON, SweConst.SE_MARS, SweConst.SE_MERCURY, 
            SweConst.SE_JUPITER, SweConst.SE_VENUS, SweConst.SE_SATURN, SweConst.SE_TRUE_NODE
        };
        String[] pNames = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"};
        
        double[] xx = new double[6];
        StringBuffer serr = new StringBuffer();
        
        for (int i = 0; i < planets.length; i++) {
            sw.swe_calc_ut(tjdUt, planets[i], iflag, xx, serr);
            double lon = xx[0];
            positions.put(pNames[i], createPlanetPosition(pNames[i], lon, lagnaLongitude, xx[3] < 0));
            
            if (planets[i] == SweConst.SE_TRUE_NODE) {
                double ketuLon = (lon + 180.0) % 360.0;
                positions.put("Ketu", createPlanetPosition("Ketu", ketuLon, lagnaLongitude, true));
            }
        }
        
        return positions;
    }

    private PlanetPosition createPlanetPosition(String name, double lon, double lagnaLon, boolean retrograde) {
        int rashiIndex = (int) (lon / 30.0);
        double degreeInRashi = lon % 30.0;
        NakshatraInfo nakInfo = getNakshatra(lon);
        int houseNum = getHouseNumber(lon, lagnaLon);
        
        return new PlanetPosition(
            name, lon, rashiIndex, RASHI_NAMES[rashiIndex], degreeInRashi,
            nakInfo.index, nakInfo.name, nakInfo.pada, retrograde, houseNum
        );
    }

    public double calculateLagna(double tjdUt, double latitude, double longitude) {
        double[] cusps = new double[37];
        double[] ascmc = new double[10];
        sw.swe_houses(tjdUt, SweConst.SEFLG_SIDEREAL, latitude, longitude, 'W', cusps, ascmc);
        return ascmc[0];
    }

    public List<DashaPeriod> calculateVimshottariMahadashas(double moonLongitude, LocalDate birthDate) {
        List<DashaPeriod> dashas = new ArrayList<>();
        double nakSpan = 360.0 / 27.0;
        int nakIndex = (int) (moonLongitude / nakSpan);
        double degInNak = moonLongitude % nakSpan;
        
        int currentLordIndex = nakIndex % 9;
        double balanceFraction = 1.0 - (degInNak / nakSpan);
        
        LocalDate currentDate = birthDate;
        
        for (int i = 0; i < 9; i++) {
            int lordIdx = (currentLordIndex + i) % 9;
            double years = DASHA_YEARS[lordIdx];
            
            if (i == 0) {
                years = years * balanceFraction;
            }
            
            long days = Math.round(years * 365.25);
            LocalDate endDate = currentDate.plusDays(days);
            
            List<DashaPeriod> antardashas = calculateAntardashas(lordIdx, currentDate, years, DASHA_YEARS[lordIdx]);
            
            dashas.add(new DashaPeriod(DASHA_LORDS[lordIdx], currentDate, endDate, antardashas));
            currentDate = endDate;
        }
        
        return dashas;
    }
    
    private List<DashaPeriod> calculateAntardashas(int mahadashaLordIndex, LocalDate startDate, double actualYears, double totalYearsOfLord) {
        List<DashaPeriod> antardashas = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        double totalDashaYears = 120.0;
        
        for (int i = 0; i < 9; i++) {
            int antarLordIdx = (mahadashaLordIndex + i) % 9;
            double antarYears = (actualYears * DASHA_YEARS[antarLordIdx]) / totalDashaYears;
            
            if (actualYears < totalYearsOfLord) {
                 antarYears = (actualYears * DASHA_YEARS[antarLordIdx]) / 120.0; 
            }
            long days = Math.round((DASHA_YEARS[mahadashaLordIndex] * DASHA_YEARS[antarLordIdx]) / 120.0 * 365.25);
            if (actualYears < totalYearsOfLord) {
                 if (i==0) days = Math.round(actualYears * 365.25 * (DASHA_YEARS[antarLordIdx] / totalDashaYears));
                 else days = Math.round((actualYears * 365.25) * (DASHA_YEARS[antarLordIdx]/120.0));
                 days = Math.round(actualYears * 365.25 * (DASHA_YEARS[antarLordIdx] / 120.0)); 
            } else {
                 days = Math.round((DASHA_YEARS[mahadashaLordIndex] * DASHA_YEARS[antarLordIdx]) / 120.0 * 365.25);
            }

            days = Math.round(actualYears * 365.25 * (DASHA_YEARS[antarLordIdx] / 120.0));
            LocalDate endDate = currentDate.plusDays(days);
            antardashas.add(new DashaPeriod(DASHA_LORDS[antarLordIdx], currentDate, endDate, null));
            currentDate = endDate;
        }
        return antardashas;
    }

    private NakshatraInfo getNakshatra(double longitude) {
        double nakSpan = 360.0 / 27.0;
        int index = (int) (longitude / nakSpan);
        double degreeInNak = longitude % nakSpan;
        int pada = (int) (degreeInNak / (nakSpan / 4.0)) + 1;
        return new NakshatraInfo(index, NAKSHATRA_NAMES[index], pada);
    }

    private int getHouseNumber(double planetLon, double lagnaLon) {
        int rashiOfPlanet = (int) (planetLon / 30.0);
        int rashiOfLagna = (int) (lagnaLon / 30.0);
        return ((rashiOfPlanet - rashiOfLagna + 12) % 12) + 1;
    }

    private record NakshatraInfo(int index, String name, int pada) {}
}
