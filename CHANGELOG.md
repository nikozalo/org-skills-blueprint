# Changelog

What changed for the people who use the Acme plugins, newest first. Each plugin has its own
version number. A change reaches you when its plugin's version goes up: Cowork picks it up
after the change is merged, and Claude Code when it updates the marketplace. Each version is
also tagged in git as `<plugin>-v<version>`, for example `acme-v0.1.0`.

## acme-marketing 0.1.0

- `/acme-marketing:voice-check` checks a draft against Acme's voice guide and lists every line
  that breaks it, with the rule and a suggested fix.

## acme 0.1.0

- `/acme:setup` puts the shared Acme context and your role into your instructions.
- `/acme:meeting-notes` turns a transcript into the standard Acme meeting record.
- `/acme:contribute` fixes a skill or proposes a new one, in Claude Code, without knowing GitHub.
