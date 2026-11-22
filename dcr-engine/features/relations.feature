Feature: DCR relations
  Expected results follow the operational semantics of DCR graphs
  (Hildebrandt and Mukkamala 2010). Executing e: Ex' = Ex + {e},
  Re' = (Re - {e}) + e*->, In' = (In - e->%) + e->+.
  e is enabled iff e is included, every included condition of e is
  executed, and no included milestone of e is pending.
  Every scenario runs against the plain API and the S-API used by the app.

  Scenario Outline: A condition blocks its target until it has been executed (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is a condition for "B"
    Then "B" is not enabled
    When "A" is executed
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: An excluded condition does not block (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is a condition for "B"
    And "A" is initially excluded
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A response makes its target pending until it is executed (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is a response for "B"
    When "A" is executed
    Then "B" is pending
    And the graph is not accepting
    When "B" is executed
    Then "B" is not pending
    And the graph is accepting

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A self-response leaves the event pending after it runs (<api>)
    Given the API is "<api>"
    And a graph with events "A"
    And "A" is a response for "A"
    When "A" is executed
    Then "A" is pending

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: An excluded event is not enabled until it is included (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is an include for "B"
    And "B" is initially excluded
    Then "B" is not enabled
    When "A" is executed
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: An exclude disables its target (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is an exclude for "B"
    When "A" is executed
    Then "B" is not enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A self-exclude lets an event run at most once (<api>)
    Given the API is "<api>"
    And a graph with events "A"
    And "A" is an exclude for "A"
    When "A" is executed
    Then "A" is not enabled

    Examples:
      | api   |
      | plain |
      | S     |

  # Contested case: In' = (In - e->%) + e->+ means the include wins.
  # To be confirmed with the course/maintainer.
  Scenario Outline: When an event both includes and excludes a target, the include wins (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is an include for "B"
    And "A" is an exclude for "B"
    And "B" is initially excluded
    When "A" is executed
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: A pending milestone blocks its target until it is executed (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is a milestone for "B"
    And "A" is initially pending
    Then "B" is not enabled
    When "A" is executed
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: An excluded pending milestone does not block (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is a milestone for "B"
    And "A" is initially pending
    And "A" is initially excluded
    Then "B" is enabled

    Examples:
      | api   |
      | plain |
      | S     |

  Scenario Outline: Executing an event records it and an exclude removes the target from the included set (<api>)
    Given the API is "<api>"
    And a graph with events "A, B"
    And "A" is an exclude for "B"
    Then "B" is included
    When "A" is executed
    Then "A" has been executed
    And "B" is not included

    Examples:
      | api   |
      | plain |
      | S     |
