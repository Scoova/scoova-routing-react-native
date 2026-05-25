# Changelog

All notable changes to `@scoova/routing-react-native` are recorded here.
This project follows [Semantic Versioning](https://semver.org/).

## 1.2.0 — 2026-05-25
- Internal: tag-triggered CI publishing wired up; this is the first release built and pushed by GitHub Actions. No public API changes from 1.1.x.

## 1.1.1 — 2026-05-25
- Default `baseUrl` switched from the retired `https://routing.scoo-va.info` subdomain to the central gateway at `https://api.scoo-va.info/api/v1/routing`. Callers who explicitly set `baseUrl` are unaffected. The old subdomain returns `ENDPOINT_RETIRED`.

## 1.1.0 — 2026-05-25

### Added

- **Locale support on `ClientOptions`** — set a default `locale` (e.g. `'fr'`,
  `'ar-EG'`, `'pt-BR'`) once and every request carries it as both the
  `?locale=` query parameter and the `Accept-Language` header. Defaults to
  `'en'`. Per-call `options.locale` overrides the client default.
- **`apiKey` on `ClientOptions`** — sent as `X-API-Key` when set, for calls
  routed through the `api.scoo-va.info/v1/routing/*` gateway.
- **`elevation(shape, range?)`** — alias for `height()`, matching the unified
  SDK naming.

### Endpoints (verified parity across all 5 platforms)

`route`, `optimizedRoute`, `isochrone`, `matrix`, `height` (alias `elevation`),
`mapMatch`, `locate`, `status`.

### Other

- License changed to Apache-2.0.
- Repository URL is now `https://github.com/Scoova/scoova-routing-react-native`.

## 1.0.0 — 2026-05-12

First public release. React Native build of `@scoova/routing` — pure
TypeScript, no native modules required.
