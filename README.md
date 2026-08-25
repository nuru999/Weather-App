<p align="center">
  <img src="./assets/weather-app-banner.svg" width="100%" alt="Atmosphere Weather Application" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827" alt="JavaScript ES6+" />
  <img src="https://img.shields.io/badge/Node.js-Proxy-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js proxy" />
  <img src="https://img.shields.io/badge/OpenWeather-API-EB6E4B?style=for-the-badge" alt="OpenWeather API" />
</p>

## Overview

**Atmosphere** is a responsive weather application with city search, browser geolocation, current conditions, recent searches, unit switching, and a five-day forecast.

The browser calls this project's own `/api/weather/*` endpoints. The Node server validates requests, rate-limits clients, adds timeouts, and attaches the OpenWeather key only on the server. No API key is sent to the browser or committed to GitHub.

## Security architecture

```text
Browser -> /api/weather/current or /forecast -> OpenWeather
                         server adds key here ^
```

- `OPENWEATHER_API_KEY` is read only from the server environment.
- City names and coordinates are validated.
- API traffic is rate-limited to reduce abuse.
- Upstream requests time out after eight seconds.
- Error responses never reveal the API key or upstream request URL.

## Run locally

```bash
git clone https://github.com/nuru999/Weather-App.git
cd Weather-App
npm install
cp .env.example .env
```

Set `OPENWEATHER_API_KEY` in `.env`, then load it into your shell and start the app:

```bash
set -a
source .env
set +a
npm start
```

Open `http://localhost:3000`.

## API endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Service and configuration status |
| `GET /api/weather/current?q=Nairobi` | Current conditions by city |
| `GET /api/weather/current?lat=-1.29&lon=36.82` | Current conditions by coordinates |
| `GET /api/weather/forecast?q=Nairobi` | Five-day forecast |

## Render deployment

Create a Node web service from this repository using:

- Build command: `npm install --omit=dev`
- Start command: `npm start`
- Environment variable: `OPENWEATHER_API_KEY` (set privately in Render)
- Health check: `/api/health`

The old client-side `config.js` flow has been removed. Never add API keys to `script.js`, HTML, GitHub Actions output, or a `VITE_*` variable.

---

<p align="center">Built by <a href="https://github.com/nuru999">Nuru Amudi</a>.</p>
