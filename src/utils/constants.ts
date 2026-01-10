import { DiagramType } from '@/types'

export const APP_NAME = 'Flowify'
export const APP_VERSION = '1.0.0'

export const LOCALSTORAGE_KEYS = {
  DIAGRAM: 'flowify_diagram',
  TABS: 'flowify_tabs',
  EDITOR_SETTINGS: 'flowify_editor_settings',
  LAYOUT: 'flowify_layout',
  THEME: 'flowify_theme',
  RECENT_FILES: 'flowify_recent_files',
} as const

export const DEFAULT_EDITOR_SETTINGS = {
  fontSize: 14,
  tabSize: 2,
  lineWrapping: true,
  lineNumbers: true,
  theme: 'dark' as const,
}

export const BLANK_DIAGRAM_CONTENT: Record<DiagramType, string> = {
  [DiagramType.CLASS]: `classDiagram
    class MyClass
`,
  [DiagramType.SEQUENCE]: `sequenceDiagram
    participant A
`,
  [DiagramType.FLOWCHART]: `flowchart TD
    A[Start]
`,
  [DiagramType.STATE]: `stateDiagram-v2
    [*] --> State1
`,
  [DiagramType.ER]: `erDiagram
    ENTITY
`,
  [DiagramType.GANTT]: `gantt
    title My Project
    dateFormat YYYY-MM-DD
    section Tasks
        Task 1: 2024-01-01, 1d
`,
  [DiagramType.PIE]: `pie title My Chart
    "Item 1": 100
`,
  [DiagramType.MINDMAP]: `mindmap
    root((Main Topic))
`,
  [DiagramType.TIMELINE]: `timeline
    title My Timeline
    2024: Event 1
`,
  [DiagramType.GITGRAPH]: `gitGraph
    commit
`,
}

export const DEFAULT_DIAGRAM_CONTENT: Record<DiagramType, string> = {
  [DiagramType.CLASS]: `classDiagram
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

  [DiagramType.SEQUENCE]: `sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Request data
    System->>Database: Query
    Database-->>System: Return results
    System-->>User: Display data`,

  [DiagramType.FLOWCHART]: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,

  [DiagramType.STATE]: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry`,

  [DiagramType.ER]: `erDiagram
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
    }
    PRODUCT {
        int id PK
        string name
        float price
    }`,

  [DiagramType.GANTT]: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Planning
        Requirements    :a1, 2024-01-01, 7d
        Design          :a2, after a1, 5d
    section Development
        Implementation  :a3, after a2, 14d
        Testing         :a4, after a3, 7d
    section Deployment
        Release         :a5, after a4, 2d`,

  [DiagramType.PIE]: `pie showData title Browser Market Share
    "Chrome": 65
    "Safari": 19
    "Firefox": 8
    "Edge": 5
    "Other": 3`,

  [DiagramType.MINDMAP]: `mindmap
    root((Project Planning))
        Goals
            Increase Revenue
            Improve UX
        Resources
            Team
                Developers
                Designers
            Budget
        Timeline
            Q1
            Q2`,

  [DiagramType.TIMELINE]: `timeline
    title Product Roadmap
    section 2024
        Q1: Research & Planning
        Q2: MVP Development
        Q3: Beta Launch
        Q4: Public Release
    section 2025
        Q1: Feature Expansion`,

  [DiagramType.GITGRAPH]: `gitGraph
    commit id: "Initial"
    branch develop
    commit id: "Add feature"
    commit id: "Fix bug"
    checkout main
    merge develop id: "Release v1.0"
    branch hotfix
    commit id: "Critical fix"
    checkout main
    merge hotfix id: "v1.0.1"`,
}

export const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  [DiagramType.CLASS]: 'Class Diagram',
  [DiagramType.SEQUENCE]: 'Sequence Diagram',
  [DiagramType.FLOWCHART]: 'Flowchart',
  [DiagramType.STATE]: 'State Diagram',
  [DiagramType.ER]: 'ER Diagram',
  [DiagramType.GANTT]: 'Gantt Chart',
  [DiagramType.PIE]: 'Pie Chart',
  [DiagramType.MINDMAP]: 'Mind Map',
  [DiagramType.TIMELINE]: 'Timeline',
  [DiagramType.GITGRAPH]: 'Git Graph',
}

export const AUTO_SAVE_DELAY = 300 // milliseconds

export const FILE_EXTENSIONS = {
  MERMAID: '.mmd',
  JSON: '.json',
} as const

export const MAX_RECENT_FILES = 10

export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  NEW: 'Ctrl+N',
  OPEN: 'Ctrl+O',
  EXPORT: 'Ctrl+E',
  FORMAT: 'Ctrl+Shift+F',
} as const
