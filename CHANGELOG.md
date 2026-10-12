# Changelog

What changed for the people who use the Acme plugins, newest first. Each plugin has its own
version number, raised with every change. Cowork picks a change up once it is merged, and Claude
Code when it sees the higher version. Each version is also tagged in git as
`<plugin>--v<version>`, for example `acme--v0.1.0`.

## acme-marketing 0.1.1

- Nothing changes in the voice check. A new test case checks that it stays out of the way when
  you ask for something else, such as a translation.

## acme 0.1.1

- Nothing changes in how the skills work. A new test case checks that meeting notes stay out of
  the way when you ask for an agenda, and `/acme:contribute` explains version numbers correctly.

## acme-marketing 0.1.0

- `/acme-marketing:voice-check` checks a draft against Acme's voice guide and lists every line
  that breaks it, with the rule and a suggested fix.

## acme 0.1.0

- `/acme:setup` puts the shared Acme context and your role into your instructions.
- `/acme:meeting-notes` turns a transcript into the standard Acme meeting record.
- `/acme:contribute` fixes a skill or proposes a new one, in Claude Code, without knowing GitHub.
