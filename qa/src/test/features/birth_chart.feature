Feature: Birth Chart Calculation

  Background:
    Given I am on the AstroGPT home page

  Scenario: User can submit valid birth data and see a Kundali chart
    When I enter the following birth details:
      | name | Test User       |
      | date | 1990-01-01      |
      | time | 12:00           |
    And I search for city "Mumbai" and select the first result
    And I click the "Calculate My Kundali" button
    Then I should be navigated to the chart page
    And the Kundali SVG chart should be visible
    And I should see "Lagna" information displayed
    And I should see a planet table with 9 planets

  Scenario: User sees an error when submitting incomplete birth data
    When I click the "Calculate My Kundali" button without filling any fields
    Then I should see validation error messages
    And I should remain on the home page

  Scenario: City search autocomplete works correctly
    When I type "New Delhi" in the city search field
    Then I should see a dropdown with city suggestions
    And the dropdown should contain "New Delhi"
    When I select "New Delhi" from the dropdown
    Then the latitude and longitude fields should be populated

  Scenario: User can see Dasha timeline on the chart page
    Given I have calculated a chart for a user born on "1985-06-15" at "08:30" in "Chennai"
    Then I should see the Vimshottari Dasha timeline
    And the current Mahadasha should be highlighted
    And each Mahadasha should show start and end dates
