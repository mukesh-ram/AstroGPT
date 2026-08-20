package scratch;
import com.astrogpt.model.*;
import com.astrogpt.service.VedicMathService;
import java.time.LocalDate;
import java.time.LocalTime;

public class TestAstro {
    public static void main(String[] args) {
        try {
            VedicMathService service = new VedicMathService();
            // Since init is @PostConstruct, we call it manually
            service.init();
            BirthData bd = new BirthData("Test", LocalDate.of(2003, 2, 17), LocalTime.of(14, 14), "Chennai", 13.08784, 80.27847, "Asia/Kolkata");
            NatalChart chart = service.calculateChart(bd);
            System.out.println("Success! Lagna: " + chart.lagnaLongitude());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
