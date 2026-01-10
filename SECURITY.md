# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a private security advisory on GitHub or emailing the maintainer directly.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Considerations

### API Keys

- API keys are stored locally in your browser's localStorage
- Keys are never sent to any server other than the respective AI provider (OpenAI, Anthropic, or your local LM Studio instance)
- Clear your browser data to remove stored API keys

### Data Privacy

- All diagram data is stored locally in your browser
- No data is sent to external servers (except AI provider APIs when using the chat feature)
- The application works entirely client-side
