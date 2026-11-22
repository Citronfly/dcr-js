Feature: Accepting markings
  A DCR graph is accepting iff no included event is pending.

  Scenario Outline: A fresh graph is accepting (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    Then the graph is accepting

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A pending included event makes the graph not accepting (<api>)
    Given the API is "<api>"
    And a graph with events "A"
    And "A" is already pending
    Then the graph is not accepting

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A pending excluded event does not block acceptance (<api>)
    Given the API is "<api>"
    And a graph with events "A"
    And "A" is already pending
    And "A" is excluded
    Then the graph is accepting

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: Excluding a pending event makes the graph accepting (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is an exclude for "B"
    And "B" is already pending
    Then the graph is not accepting
    When "A" is executed
    Then the graph is accepting

    Examples:
      | api   |
      | plain |
      | S     |
