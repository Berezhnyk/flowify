// Source of the context file
export enum ContextSource {
  LOCAL = 'local', // Drag & drop from filesystem
  GITHUB = 'github', // Fetched from GitHub
}

// Single file in context
export interface ContextFile {
  id: string // Unique identifier (crypto.randomUUID)
  name: string // File name (e.g., "App.vue")
  path: string // Full path or relative path
  content: string // File content as string
  language: string // Detected language (e.g., "typescript", "vue")
  size: number // Content length in bytes
  source: ContextSource // Where file came from
  addedAt: Date // When file was added
}

// GitHub repository reference
export interface GitHubRepo {
  owner: string // Repository owner
  repo: string // Repository name
  branch: string // Branch name (default: main)
  path?: string // Optional subdirectory path
}

// Context loading state
export enum ContextLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
}

// Overall context state
export interface CodebaseContext {
  files: ContextFile[] // All loaded files
  totalSize: number // Sum of all file sizes
  loadingState: ContextLoadingState
  error: string | null // Error message if any
  githubRepo: GitHubRepo | null // Current GitHub repo if any
}
