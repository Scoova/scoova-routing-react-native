# @scoova/routing-react-native

React Native build of `@scoova/routing` — pure TypeScript, no native modules
required. Routing client for `routing.scoo-va.info`.

```sh
npm install @scoova/routing-react-native
```

```ts
import { RoutingClient, decodePolyline } from '@scoova/routing-react-native';

const client = new RoutingClient({
  defaultCosting: 'scooter',
  locale: 'ar-EG',          // every request gets ?locale=ar-EG + Accept-Language
  apiKey: SCOOVA_API_KEY,
});

const result = await client.route(
  [{ lat: 30.04, lon: 31.24 }, { lat: 30.06, lon: 31.25 }],
);
const path = decodePolyline(result.trip.legs[0].shape);
```

## Endpoints

`route`, `optimizedRoute`, `isochrone`, `matrix`, `height` (alias `elevation`),
`mapMatch`, `locate`, `status`.

## Locale

Set a default locale once on the client and every call carries it as both the
`?locale=` query parameter and the `Accept-Language` HTTP header. Per-call
`options.locale` overrides the client default. The server falls back to `en`
for any unsupported code.

## Tests

```sh
npm test
```

Repo: <https://github.com/Scoova/scoova-routing-react-native>.
License: Apache-2.0.
