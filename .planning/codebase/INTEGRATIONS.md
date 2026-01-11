# External Integrations

**Analysis Date:** 2026-01-11

## APIs & External Services

**AI Provider Integrations:**

1. **OpenAI API** - `https://api.openai.com/v1`
   - SDK/Client: Native fetch with SSE streaming (`src/services/ai/openai.ts`)
   - Auth: Bearer token (API key stored in localStorage)
   - Models: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
   - Features: Chat completions with streaming support
   - Configuration: `src/stores/ai.ts`

2. **Anthropic API** - `https://api.anthropic.com/v1`
   - SDK/Client: Native fetch with SSE streaming (`src/services/ai/anthropic.ts`)
   - Auth: x-api-key header (API key stored in localStorage)
   - Models: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
   - Features: Messages API with streaming support
   - Configuration: `src/stores/ai.ts`

3. **LM Studio API** - Local OpenAI-compatible endpoint
   - SDK/Client: Native fetch with SSE streaming (`src/services/ai/lmstudio.ts`)
   - Endpoint: User-configured (e.g., `http://localhost:1234`)
   - Auth: No authentication required
   - Features: Chat completions API (OpenAI-compatible format)
   - Configuration: `src/stores/ai.ts`

**External APIs:**
- None - Fully client-side SPA

## Data Storage

**Databases:**
- None - No database (client-side only)

**File Storage:**
- None - No cloud file storage

**Caching:**
- None - No Redis or external cache

**Client-Side Storage:**
- localStorage - Primary persistence mechanism:
  - `flowify_tabs` - Diagram content, history, view state per tab
  - `flowify_layout` - UI layout state (panel sizes, visibility, theme)
  - `flowify_recent_files` - Recently opened files list
  - AI config stored via `src/stores/ai.ts` useLocalStorage composable

## Authentication & Identity

**Auth Provider:**
- None - No user authentication (standalone client app)

**OAuth Integrations:**
- None

## Monitoring & Observability

**Error Tracking:**
- None - Console.error only

**Analytics:**
- None

**Logs:**
- Browser console only (development)
- Nginx access logs in production (`docker/nginx.conf`)

## CI/CD & Deployment

**Hosting:**
- Docker container (Nginx serving static files)
- Any static hosting (Vercel, Netlify, etc. supported)
- Production build: `npm run build` outputs to `dist/`

**CI Pipeline:**
- GitHub Actions - `.github/workflows/` (build and deploy to DockerHub)

**Container Registry:**
- DockerHub (configured in GitHub Actions)

## Environment Configuration

**Development:**
- No environment variables required
- All configuration via localStorage (AI API keys set in UI)
- No .env files used

**Staging:**
- Not applicable (client-side only)

**Production:**
- Docker container with Nginx
- NODE_ENV=production set in `docker-compose.yml`
- No secrets management needed (keys in user's browser)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Service Architecture

**AI Service Factory Pattern:**
- `src/services/ai/factory.ts` - Creates appropriate service based on provider config
- `src/services/ai/base.ts` - Abstract interface for all AI providers
- All providers implement: `generateResponse()`, `streamResponse()`

**Streaming Implementation:**
- Server-Sent Events (SSE) for word-by-word AI responses
- AbortController for cancellation support
- Custom `AIError` class with provider-specific error codes (`src/types/ai.ts`)

## Browser APIs Used

- **Clipboard API** - Copy diagrams as PNG (`src/services/export/chunkedPngExport.ts`)
- **Canvas API** - PNG rendering and tile generation
- **File API** - Import/export .mmd and .json files (`src/composables/useFileOperations.ts`)
- **Web Storage API** - localStorage for persistence
- **Fetch API** - AI provider API calls with streaming

## Third-Party Integration Summary

| Service | Type | Configuration | Location |
|---------|------|---------------|----------|
| OpenAI | AI API | API Key + Model | `src/services/ai/openai.ts` |
| Anthropic | AI API | API Key + Model | `src/services/ai/anthropic.ts` |
| LM Studio | Local AI | Endpoint URL (no auth) | `src/services/ai/lmstudio.ts` |
| Mermaid.js | Diagram Engine | Theme + security config | `src/composables/useMermaid.ts` |
| CodeMirror | Editor | Theme + keybindings | `src/components/editor/CodeEditor.vue` |
| UPNG.js | PNG Encoder | Direct image encoding | `src/services/export/chunkedPngExport.ts` |

## API Key Security

- All API keys stored in browser localStorage (client-side only)
- Never sent to backend servers (no backend exists)
- Only transmitted directly to selected AI provider
- Masked in UI (password input type)
- User can clear keys anytime via settings
- **Note:** Any XSS vulnerability could expose keys (see CONCERNS.md)

---

*Integration audit: 2026-01-11*
*Update when adding/removing external services*
