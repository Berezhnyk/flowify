export const EXAMPLE_DIAGRAMS = {
  classBasic: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()*
    }
    class Cat {
        +String furColor
        +meow()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Cat
    Animal <|-- Dog`,

  sequenceBasic: `sequenceDiagram
    participant Browser
    participant Server
    participant Database

    Browser->>Server: HTTP Request
    Server->>Database: SQL Query
    Database-->>Server: Results
    Server-->>Browser: HTML Response`,

  useCaseBasic: `graph TD
    User((User))

    User --> Login[Login]
    User --> Logout[Logout]
    User --> EditProfile[Edit Profile]
    User --> ChangePassword[Change Password]

    Login --> Auth{Authenticate}
    Auth -->|Success| Dashboard[Dashboard]
    Auth -->|Failure| LoginError[Show Error]`,

  classAdvanced: `classDiagram
    class Vehicle {
        <<abstract>>
        +String brand
        +String model
        +int year
        +start()*
        +stop()*
    }

    class Car {
        +int numberOfDoors
        +String transmission
        +start()
        +stop()
        +openTrunk()
    }

    class Motorcycle {
        +boolean hasSidecar
        +start()
        +stop()
        +wheelie()
    }

    class Engine {
        +int horsepower
        +String type
        +ignite()
    }

    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    Car "1" --> "1" Engine : has
    Motorcycle "1" --> "1" Engine : has`,

  sequenceAdvanced: `sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Auth
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>API: POST /login
    API->>Auth: Validate credentials

    alt Valid credentials
        Auth->>Database: Get user info
        Database-->>Auth: User data
        Auth-->>API: JWT token
        API-->>Frontend: Success + token
        Frontend-->>User: Redirect to dashboard
    else Invalid credentials
        Auth-->>API: Error
        API-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end`,
}

export function getExampleDiagram(key: keyof typeof EXAMPLE_DIAGRAMS): string {
  return EXAMPLE_DIAGRAMS[key]
}

export function getAllExamples(): Record<string, string> {
  return { ...EXAMPLE_DIAGRAMS }
}
