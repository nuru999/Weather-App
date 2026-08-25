import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
const rootDir = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=()');
  next();
});

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

app.use('/api/weather', apiLimiter);

function parseLocation(query) {
  const city = typeof query.q === 'string' ? query.q.trim() : '';
  if (city) {
    if (city.length > 80) return null;
    return { q: city };
  }

  const lat = Number(query.lat);
  const lon = Number(query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat: String(lat), lon: String(lon) };
}

async function requestOpenWeather(endpoint, location) {
  if (!apiKey) {
    return { status: 503, body: { error: 'Weather service is not configured.' } };
  }

  const url = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
  Object.entries(location).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('appid', apiKey);

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await upstream.json().catch(() => ({}));

    if (upstream.status === 404) {
      return { status: 404, body: { error: 'City not found.' } };
    }
    if (!upstream.ok) {
      console.error('OpenWeather request failed', upstream.status);
      return { status: 502, body: { error: 'Weather service is temporarily unavailable.' } };
    }

    return { status: 200, body: data };
  } catch (error) {
    console.error('OpenWeather request error', error.name);
    return { status: 504, body: { error: 'Weather service timed out.' } };
  }
}

async function weatherHandler(endpoint, request, response) {
  const location = parseLocation(request.query);
  if (!location) {
    return response.status(400).json({ error: 'Provide a valid city or coordinates.' });
  }

  const result = await requestOpenWeather(endpoint, location);
  if (result.status === 200) response.setHeader('Cache-Control', 'public, max-age=300');
  return response.status(result.status).json(result.body);
}

app.get('/api/weather/current', (request, response) => weatherHandler('weather', request, response));
app.get('/api/weather/forecast', (request, response) => weatherHandler('forecast', request, response));
app.get('/api/health', (request, response) => response.json({ ok: true, weatherConfigured: Boolean(apiKey) }));

app.use('/assets', express.static(path.join(rootDir, 'assets'), { maxAge: '1d' }));
app.use('/images', express.static(path.join(rootDir, 'images'), { maxAge: '1d' }));
app.use('/js', express.static(path.join(rootDir, 'js'), { maxAge: '1d' }));
app.get('/style.css', (request, response) => response.sendFile(path.join(rootDir, 'style.css')));
app.get('/script.js', (request, response) => response.sendFile(path.join(rootDir, 'script.js')));
app.get('/', (request, response) => response.sendFile(path.join(rootDir, 'index.html')));

app.use((request, response) => {
  if (request.path.startsWith('/api/')) return response.status(404).json({ error: 'API route not found.' });
  return response.status(404).send('Not found');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Atmosphere listening on port ${port}`);
});
