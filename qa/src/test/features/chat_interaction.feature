Feature: AI Chat Interaction

  Background:
    Given I have a calculated chart for user born on "1990-01-01" at "12:00" in "Mumbai"
    And I am on the chart page

  Scenario: User can send a message and receive a streaming AI response
    When I type "What does my Lagna tell about me?" in the chat input
    And I press the send button
    Then the message should appear in the chat as a user message
    And a loading indicator should appear
    And eventually an AI response should appear
    And the AI response should be non-empty

  Scenario: Chat input accepts Enter key to send
    When I type "Tell me about my current Mahadasha" in the chat input
    And I press the Enter key
    Then the message should be sent

  Scenario: Chat history persists during the session
    When I send the message "What is my Lagna?"
    And I send the message "Tell me about my Moon sign"
    Then I should see 2 user messages and 2 assistant responses in the chat

  Scenario: Clear history button resets the conversation
    When I send the message "Hello"
    And I click the clear history button
    Then the chat should show only the welcome message

  Scenario: Long AI responses stream progressively
    When I send a complex question "Give me a detailed reading of all my planetary positions"
    Then the response should appear progressively token by token
    And a streaming cursor should be visible during streaming
