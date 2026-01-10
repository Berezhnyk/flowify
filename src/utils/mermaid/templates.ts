import { DiagramType } from '@/types'

export const DIAGRAM_TEMPLATES: Record<DiagramType, string[]> = {
  [DiagramType.CLASS]: [
    `classDiagram
    class Animal {
        +String name
        +int age
        +isMammal()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`,
  ],

  [DiagramType.SEQUENCE]: [
    `sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Request data
    System->>Database: Query
    Database-->>System: Return results
    System-->>User: Display data`,
  ],

  [DiagramType.FLOWCHART]: [
    `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
  ],

  [DiagramType.STATE]: [
    `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry`,
  ],

  [DiagramType.ER]: [
    `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "is in"

    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created
        string status
    }`,
  ],

  [DiagramType.GANTT]: [
    `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Planning
        Requirements    :a1, 2024-01-01, 7d
        Design          :a2, after a1, 5d
    section Development
        Implementation  :a3, after a2, 14d
        Testing         :a4, after a3, 7d`,
  ],

  [DiagramType.PIE]: [
    `pie showData title Browser Market Share
    "Chrome": 65
    "Safari": 19
    "Firefox": 8
    "Edge": 5
    "Other": 3`,
  ],

  [DiagramType.MINDMAP]: [
    `mindmap
    root((Project Planning))
        Goals
            Increase Revenue
            Improve UX
        Resources
            Team
                Developers
                Designers
            Budget`,
  ],

  [DiagramType.TIMELINE]: [
    `timeline
    title Product Roadmap
    section 2024
        Q1: Research & Planning
        Q2: MVP Development
        Q3: Beta Launch
        Q4: Public Release`,
  ],

  [DiagramType.GITGRAPH]: [
    `gitGraph
    commit id: "Initial"
    branch develop
    commit id: "Add feature"
    commit id: "Fix bug"
    checkout main
    merge develop id: "Release v1.0"`,
  ],
}

export function getTemplate(type: DiagramType, index = 0): string {
  const templates = DIAGRAM_TEMPLATES[type]
  if (!templates || templates.length === 0) {
    return ''
  }
  return templates[index] ?? templates[0] ?? ''
}

export function getAllTemplates(type: DiagramType): string[] {
  return DIAGRAM_TEMPLATES[type] || []
}
