// Shared CORS handling for TIPIT's Edge Functions.
//
// These functions are called from the Capacitor app (iOS/Android), not
// from any Lovable-hosted preview anymore. Capacitor's WKWebView/WebView
// sends one of these origins depending on platform and config:
//
//   - capacitor.config.ts sets ios.scheme = 'TIPIT', so the iOS app runs
//     on the custom origin `tipit://localhost`
//   - Capacitor's default iOS origin (if the scheme is ever reset) is
//     `capacitor://localhost`
//   - Android's default Capacitor origin is `https://localhost`
//   - `npm run dev` serves the web app locally on the port from
//     vite.config.ts (8080)
//
// There's no published web preview yet — when one exists, add its
// origin (e.g. 'https://tipit.example.com') to this list.
const ALLOWED_ORIGINS = [
  'tipit://localhost',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:8080',
];

export function getCorsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}
