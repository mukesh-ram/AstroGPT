package com.astrogpt.qa.steps;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.*;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.assertj.core.api.Assertions;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Cucumber step definitions for birth chart calculation scenarios.
 * Covers the home page birth data form and the resulting chart display.
 */
public class BirthChartSteps {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String appUrl = System.getProperty("app.url", "http://localhost:4200");
    private final boolean headless = Boolean.parseBoolean(System.getProperty("headless", "false"));

    @Before
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        if (headless) {
            options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        }
        options.addArguments("--window-size=1920,1080");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Given("I am on the AstroGPT home page")
    public void iAmOnTheHomePage() {
        driver.get(appUrl);
        wait.until(ExpectedConditions.titleContains("AstroGPT"));
    }

    @When("I enter the following birth details:")
    public void iEnterBirthDetails(Map<String, String> dataTable) {
        if (dataTable.containsKey("name")) {
            WebElement nameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("birth-name")));
            nameInput.clear();
            nameInput.sendKeys(dataTable.get("name"));
        }
        if (dataTable.containsKey("date")) {
            WebElement dateInput = driver.findElement(By.id("birth-date"));
            dateInput.sendKeys(dataTable.get("date"));
        }
        if (dataTable.containsKey("time")) {
            WebElement timeInput = driver.findElement(By.id("birth-time"));
            timeInput.sendKeys(dataTable.get("time"));
        }
    }

    @When("I search for city {string} and select the first result")
    public void iSearchForCityAndSelectFirstResult(String city) {
        WebElement cityInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("birth-city")));
        cityInput.clear();
        cityInput.sendKeys(city);

        // Wait for autocomplete dropdown
        List<WebElement> suggestions = wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(
                By.cssSelector(".city-suggestion-item"), 0));
        suggestions.get(0).click();
    }

    @When("I click the {string} button")
    public void iClickButton(String buttonText) {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(), '" + buttonText + "')]")));
        button.click();
    }

    @Then("I should be navigated to the chart page")
    public void iShouldBeNavigatedToChartPage() {
        wait.until(ExpectedConditions.urlContains("/chart"));
        Assertions.assertThat(driver.getCurrentUrl()).contains("/chart");
    }

    @Then("the Kundali SVG chart should be visible")
    public void kundaliSvgShouldBeVisible() {
        WebElement svg = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("app-kundali-viewer svg")));
        Assertions.assertThat(svg.isDisplayed()).isTrue();
        // Verify the SVG has house elements
        List<WebElement> houses = svg.findElements(By.cssSelector(".house-cell"));
        Assertions.assertThat(houses.size()).isGreaterThanOrEqualTo(12);
    }

    @Then("I should see {string} information displayed")
    public void iShouldSeeInformationDisplayed(String info) {
        boolean found = !driver.findElements(By.xpath("//*[contains(text(), '" + info + "')]")).isEmpty();
        Assertions.assertThat(found).as("Expected to find text: " + info).isTrue();
    }

    @Then("I should see a planet table with {int} planets")
    public void iShouldSeePlanetTable(int expectedCount) {
        List<WebElement> rows = wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(
                By.cssSelector("app-planet-table .planet-row"), expectedCount - 1));
        Assertions.assertThat(rows.size()).isEqualTo(expectedCount);
    }

    @When("I click the {string} button without filling any fields")
    public void iClickButtonWithoutFillingFields(String buttonText) {
        iClickButton(buttonText);
    }

    @Then("I should see validation error messages")
    public void iShouldSeeValidationErrors() {
        List<WebElement> errors = wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(
                By.cssSelector(".field-error, .validation-error"), 0));
        Assertions.assertThat(errors).isNotEmpty();
    }

    @Then("I should remain on the home page")
    public void iShouldRemainOnHomePage() {
        Assertions.assertThat(driver.getCurrentUrl()).doesNotContain("/chart");
    }

    @When("I type {string} in the city search field")
    public void iTypeInCitySearchField(String city) {
        WebElement cityInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("birth-city")));
        cityInput.clear();
        cityInput.sendKeys(city);
    }

    @Then("I should see a dropdown with city suggestions")
    public void iShouldSeeDropdown() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".city-suggestions-dropdown")));
    }

    @Then("the dropdown should contain {string}")
    public void dropdownShouldContain(String cityName) {
        List<WebElement> suggestions = driver.findElements(By.cssSelector(".city-suggestion-item"));
        boolean found = suggestions.stream().anyMatch(el -> el.getText().contains(cityName));
        Assertions.assertThat(found).as("Dropdown should contain city: " + cityName).isTrue();
    }

    @When("I select {string} from the dropdown")
    public void iSelectFromDropdown(String cityName) {
        WebElement item = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[contains(@class,'city-suggestion-item') and contains(text(),'" + cityName + "')]")));
        item.click();
    }

    @Then("the latitude and longitude fields should be populated")
    public void latLonFieldsShouldBePopulated() {
        // These are hidden inputs but should have values
        WebElement latField = driver.findElement(By.id("birth-latitude"));
        WebElement lonField = driver.findElement(By.id("birth-longitude"));
        Assertions.assertThat(latField.getAttribute("value")).isNotBlank();
        Assertions.assertThat(lonField.getAttribute("value")).isNotBlank();
    }

    @Given("I have calculated a chart for a user born on {string} at {string} in {string}")
    public void iHaveCalculatedAChart(String date, String time, String city) {
        driver.get(appUrl);
        WebElement nameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("birth-name")));
        nameInput.sendKeys("QA Test User");
        driver.findElement(By.id("birth-date")).sendKeys(date);
        driver.findElement(By.id("birth-time")).sendKeys(time);
        iTypeInCitySearchField(city);
        iSearchForCityAndSelectFirstResult(city);
        iClickButton("Calculate My Kundali");
        wait.until(ExpectedConditions.urlContains("/chart"));
    }

    @Then("I should see the Vimshottari Dasha timeline")
    public void iShouldSeeDashaTimeline() {
        WebElement timeline = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("app-dasha-timeline")));
        Assertions.assertThat(timeline.isDisplayed()).isTrue();
    }

    @Then("the current Mahadasha should be highlighted")
    public void currentMahadashaShouldBeHighlighted() {
        List<WebElement> highlighted = driver.findElements(By.cssSelector(".dasha-period.active, .dasha-period.current"));
        Assertions.assertThat(highlighted).isNotEmpty();
    }

    @Then("each Mahadasha should show start and end dates")
    public void eachMahadashaShouldShowDates() {
        List<WebElement> periods = driver.findElements(By.cssSelector(".dasha-period"));
        Assertions.assertThat(periods.size()).isGreaterThanOrEqualTo(9);
        periods.forEach(period -> {
            String text = period.getText();
            Assertions.assertThat(text).matches(".*\\d{4}.*"); // Contains a year
        });
    }
}
