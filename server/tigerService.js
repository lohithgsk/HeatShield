const { Pool } = require('pg');
const axios = require('axios');

// Raleigh Microclimate Station Nodes (distributed across key census tracts)
const RALEIGH_STATIONS = [
  { id: 'KRDU_AIRPORT', name: 'Raleigh-Durham Airport (NOAA Baseline)', lat: 35.8776, lon: -78.7875, tract: '37183054106', uhiOffset: 0.0 },
  { id: 'DOWNTOWN_CORE', name: 'Downtown Raleigh (Urban Heat Island Core)', lat: 35.7796, lon: -78.6382, tract: '37183050100', uhiOffset: 4.2 },
  { id: 'CHAVIS_PARK_SE', name: 'Southeast Raleigh (Low Canopy / High SVI)', lat: 35.7712, lon: -78.6271, tract: '37183050600', uhiOffset: 3.8 },
  { id: 'NORTH_HILLS', name: 'North Hills Mixed Commercial', lat: 35.8364, lon: -78.6433, tract: '37183053709', uhiOffset: 2.5 },
  { id: 'CENTENNIAL_CAMPUS', name: 'NC State Centennial Campus (Lake Raleigh)', lat: 35.7688, lon: -78.6750, tract: '37183052202', uhiOffset: -1.2 },
  { id: 'UMSTEAD_FOREST', name: 'William B. Umstead State Park (Dense Canopy)', lat: 35.8900, lon: -78.7500, tract: '37183054104', uhiOffset: -4.5 }
];

let pool = null;
let isConnected = false;
let lastIngestTime = null;
let ingestionStats = { totalIngested: 0, lastError: null };

function calculateHeatIndex(tempF, rh) {
  if (tempF < 80) return tempF;
  const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * rh
    - 0.22475541 * tempF * rh - 0.00683783 * tempF * tempF
    - 0.05481717 * rh * rh + 0.00122874 * tempF * tempF * rh
    + 0.00085282 * tempF * rh * rh - 0.00000199 * tempF * tempF * rh * rh;
  return Math.round(hi * 10) / 10;
}

function initPool() {
  const rawUrl = process.env.TIGER_DATA_URL;
  if (!rawUrl) {
    console.warn('[TigerData] No TIGER_DATA_URL found in environment.');
    return null;
  }

  const cleanUrl = rawUrl.replace('?sslmode=require', '');
  pool = new Pool({
    connectionString: cleanUrl,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('[TigerData] Unexpected client error on idle client', err);
  });

  return pool;
}

async function initSchema() {
  if (!pool) initPool();
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      console.log('[TigerData] Initializing hypertable schema...');

      await client.query(`
        CREATE TABLE IF NOT EXISTS raleigh_heat_telemetry (
          recorded_at      TIMESTAMPTZ NOT NULL,
          station_id       VARCHAR(50) NOT NULL,
          station_name     VARCHAR(120),
          latitude         DOUBLE PRECISION NOT NULL,
          longitude        DOUBLE PRECISION NOT NULL,
          tract_geoid      VARCHAR(25),
          temperature_f    DOUBLE PRECISION NOT NULL,
          feels_like_f     DOUBLE PRECISION NOT NULL,
          humidity_pct     DOUBLE PRECISION NOT NULL,
          solar_radiation  DOUBLE PRECISION,
          wind_speed_mph   DOUBLE PRECISION,
          heat_index_f     DOUBLE PRECISION NOT NULL,
          uhi_offset_f     DOUBLE PRECISION DEFAULT 0
        );
      `);

      try {
        await client.query(`SELECT create_hypertable('raleigh_heat_telemetry', 'recorded_at', if_not_exists => TRUE);`);
        console.log('[TigerData] Hypertable raleigh_heat_telemetry verified/created.');
      } catch (htErr) {
        console.log('[TigerData] Hypertable notice:', htErr.message);
      }

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_telemetry_station_time
        ON raleigh_heat_telemetry (station_id, recorded_at DESC);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_telemetry_tract_time
        ON raleigh_heat_telemetry (tract_geoid, recorded_at DESC);
      `);

      // ── Municipal HeatShield Users Table (City Planners & EMS Dispatch) ──
      await client.query(`
        CREATE TABLE IF NOT EXISTS heatshield_users (
          id            SERIAL PRIMARY KEY,
          username      VARCHAR(80) UNIQUE NOT NULL,
          password_hash VARCHAR(100) NOT NULL,
          full_name     VARCHAR(120) NOT NULL,
          role          VARCHAR(50) NOT NULL, -- 'city_planner' | 'emergency_ems'
          department    VARCHAR(120),
          badge_number  VARCHAR(50),
          created_at    TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed Default Sample Users if empty
      const userCheck = await client.query('SELECT COUNT(*) FROM heatshield_users;');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        console.log('[TigerData] Seeding sample users in heatshield_users...');
        await client.query(`
          INSERT INTO heatshield_users (username, password_hash, full_name, role, department, badge_number)
          VALUES 
            ('planner_sarah', 'raleigh2026!', 'Sarah Jenkins, AICP', 'city_planner', 'Raleigh Urban Planning & Heat Equity', 'PLN-8820'),
            ('planner_marcus', 'heatshield!', 'Marcus Vance, PE', 'city_planner', 'Capital Improvement & Shading Infrastructure', 'PLN-4192'),
            ('ems_dispatch', 'wake911!', 'Dispatcher Ortiz', 'emergency_ems', 'Wake County 911 Communications', 'WAKE-911-D'),
            ('ems_captain_davis', 'dispatch2026!', 'Capt. Ronald Davis', 'emergency_ems', 'Wake County EMS Heat Response Division', 'EMS-MED-04');
        `);
        console.log('[TigerData] Sample users seeded successfully.');
      }

      // ── Community Alert Subscriptions Table ──
      await client.query(`
        CREATE TABLE IF NOT EXISTS community_alert_subscriptions (
          id             SERIAL PRIMARY KEY,
          email          VARCHAR(180) NOT NULL,
          addresses      JSONB NOT NULL,
          subscribed_at  TIMESTAMPTZ DEFAULT NOW(),
          active         BOOLEAN DEFAULT TRUE
        );
      `);

      isConnected = true;
      console.log('[TigerData] Schema & authentication tables initialized successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[TigerData] Schema initialization failed:', err.message);
    isConnected = false;
    return false;
  }
}

async function fetchRealWorldRaleighWeather() {
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: 35.7796,
        longitude: -78.6382,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,direct_radiation',
        hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,direct_radiation,wind_speed_10m',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        past_days: 1,
        forecast_days: 1,
        timezone: 'America/New_York'
      },
      timeout: 8000
    });
    return res.data;
  } catch (err) {
    console.warn('[TigerData] Live weather fetch failed, using fallback:', err.message);
    return null;
  }
}

async function ingestLatestReading() {
  if (!pool && !initPool()) return { error: 'Database not configured' };

  const weather = await fetchRealWorldRaleighWeather();
  const now = new Date();

  const baseTemp = weather?.current?.temperature_2m ?? 86.4;
  const baseHumidity = weather?.current?.relative_humidity_2m ?? 62.0;
  const baseWind = weather?.current?.wind_speed_10m ?? 7.5;
  const baseSolar = weather?.current?.direct_radiation ?? 450.0;

  const rowsToInsert = RALEIGH_STATIONS.map((stn) => {
    const tempF = Math.round((baseTemp + stn.uhiOffset) * 10) / 10;
    const humidity = Math.min(100, Math.max(20, Math.round((baseHumidity - stn.uhiOffset * 1.5) * 10) / 10));
    const heatIndex = calculateHeatIndex(tempF, humidity);
    const feelsLike = (weather && weather.current && weather.current.apparent_temperature != null)
      ? Math.round((weather.current.apparent_temperature + stn.uhiOffset) * 10) / 10
      : heatIndex;

    return [
      now.toISOString(),
      stn.id,
      stn.name,
      stn.lat,
      stn.lon,
      stn.tract,
      tempF,
      feelsLike,
      humidity,
      baseSolar,
      baseWind,
      heatIndex,
      stn.uhiOffset
    ];
  });

  const client = await pool.connect();
  try {
    const insertQuery = `
      INSERT INTO raleigh_heat_telemetry (
        recorded_at, station_id, station_name, latitude, longitude,
        tract_geoid, temperature_f, feels_like_f, humidity_pct,
        solar_radiation, wind_speed_mph, heat_index_f, uhi_offset_f
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `;

    for (const r of rowsToInsert) {
      await client.query(insertQuery, r);
    }

    lastIngestTime = now;
    ingestionStats.totalIngested += rowsToInsert.length;
    console.log('[TigerData] Ingested ' + rowsToInsert.length + ' microclimate readings into hypertable at ' + now.toISOString());
    return { success: true, count: rowsToInsert.length, timestamp: now.toISOString() };
  } catch (err) {
    console.error('[TigerData] Ingestion error:', err.message);
    ingestionStats.lastError = err.message;
    throw err;
  } finally {
    client.release();
  }
}

async function seedHistorical24h() {
  if (!pool && !initPool()) return;

  try {
    const client = await pool.connect();
    try {
      const checkRes = await client.query('SELECT COUNT(*) FROM raleigh_heat_telemetry;');
      const existingCount = parseInt(checkRes.rows[0].count, 10);
      if (existingCount > 50) {
        console.log(`[TigerData] Hypertable already contains ${existingCount} records. Skipping historical seed.`);
        return;
      }

      console.log('[TigerData] Seeding 24h historical real-world telemetry from Open-Meteo...');
      const weather = await fetchRealWorldRaleighWeather();
      if (!weather || !weather.hourly || !weather.hourly.time) return;

      const times = weather.hourly.time;
      const temps = weather.hourly.temperature_2m;
      const humids = weather.hourly.relative_humidity_2m;
      const winds = weather.hourly.wind_speed_10m;
      const solars = weather.hourly.direct_radiation;

      const totalHours = times.length;
      const startIdx = Math.max(0, totalHours - 24);

      let seeded = 0;
      const insertQuery = `
        INSERT INTO raleigh_heat_telemetry (
          recorded_at, station_id, station_name, latitude, longitude,
          tract_geoid, temperature_f, feels_like_f, humidity_pct,
          solar_radiation, wind_speed_mph, heat_index_f, uhi_offset_f
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `;

      for (let i = startIdx; i < totalHours; i++) {
        const timeStr = times[i];
        const baseT = temps[i];
        const baseH = humids[i];
        const baseW = winds[i];
        const baseS = solars[i];

        for (const stn of RALEIGH_STATIONS) {
          const tempF = Math.round((baseT + stn.uhiOffset) * 10) / 10;
          const humidity = Math.min(100, Math.max(20, Math.round((baseH - stn.uhiOffset * 1.5) * 10) / 10));
          const heatIndex = calculateHeatIndex(tempF, humidity);

          await client.query(insertQuery, [
            timeStr,
            stn.id,
            stn.name,
            stn.lat,
            stn.lon,
            stn.tract,
            tempF,
            heatIndex,
            humidity,
            baseS,
            baseW,
            heatIndex,
            stn.uhiOffset
          ]);
          seeded++;
        }
      }
      console.log('[TigerData] Historical seed complete: ' + seeded + ' readings inserted.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[TigerData] Seeding warning:', err.message);
  }
}

async function getLatestTelemetry() {
  if (!pool && !initPool()) return { connected: false, error: 'Database not initialized' };

  const startMs = Date.now();
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT DISTINCT ON (station_id)
          recorded_at, station_id, station_name, latitude, longitude,
          tract_geoid, temperature_f, feels_like_f, humidity_pct,
          solar_radiation, wind_speed_mph, heat_index_f, uhi_offset_f
        FROM raleigh_heat_telemetry
        ORDER BY station_id, recorded_at DESC;
      `);
      const latencyMs = Date.now() - startMs;

      return {
        connected: true,
        latencyMs,
        count: result.rows.length,
        timestamp: new Date().toISOString(),
        stations: result.rows
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function getTimeBucketTrends() {
  if (!pool && !initPool()) return { connected: false, error: 'Database not initialized' };

  const startMs = Date.now();
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          time_bucket('1 hour', recorded_at) AS bucket,
          ROUND(AVG(temperature_f)::numeric, 1) AS avg_temp,
          ROUND(MAX(heat_index_f)::numeric, 1) AS max_heat_index,
          ROUND(MIN(temperature_f)::numeric, 1) AS min_temp,
          ROUND(AVG(humidity_pct)::numeric, 1) AS avg_humidity
        FROM raleigh_heat_telemetry
        WHERE recorded_at > NOW() - INTERVAL '24 hours'
        GROUP BY bucket
        ORDER BY bucket ASC;
      `;
      const result = await client.query(query);
      const latencyMs = Date.now() - startMs;

      return {
        connected: true,
        latencyMs,
        buckets: result.rows
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function getDiagnostics() {
  if (!pool && !initPool()) return { connected: false };

  try {
    const client = await pool.connect();
    try {
      const countRes = await client.query('SELECT COUNT(*) AS total_rows FROM raleigh_heat_telemetry;');
      const latestRes = await client.query('SELECT MAX(recorded_at) AS latest_reading FROM raleigh_heat_telemetry;');
      
      let chunksCount = 0;
      try {
        const chunksRes = await client.query(`
          SELECT count(*) as chunk_count 
          FROM timescaledb_information.chunks 
          WHERE hypertable_name = 'raleigh_heat_telemetry';
        `);
        chunksCount = parseInt(chunksRes.rows[0]?.chunk_count || 0, 10);
      } catch (e) {}

      return {
        connected: true,
        totalRows: parseInt(countRes.rows[0].total_rows, 10),
        latestReading: latestRes.rows[0].latest_reading,
        chunks: chunksCount,
        lastIngestTime,
        ingestionStats
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function authenticateUser(username, password) {
  if (!pool && !initPool()) return { success: false, error: 'Database not initialized' };

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT id, username, password_hash, full_name, role, department, badge_number FROM heatshield_users WHERE username = $1;',
        [username?.trim()?.toLowerCase()]
      );

      if (res.rows.length === 0) {
        return { success: false, error: 'User not found in municipal registry' };
      }

      const user = res.rows[0];
      if (user.password_hash !== password) {
        return { success: false, error: 'Invalid password credentials' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          department: user.department,
          badgeNumber: user.badge_number
        }
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getSampleUsers() {
  if (!pool && !initPool()) {
    return [
      { username: 'planner_sarah', password_hint: 'raleigh2026!', fullName: 'Sarah Jenkins, AICP', role: 'city_planner', department: 'Urban Planning & Heat Equity' },
      { username: 'planner_marcus', password_hint: 'heatshield!', fullName: 'Marcus Vance, PE', role: 'city_planner', department: 'Capital Infrastructure' },
      { username: 'ems_dispatch', password_hint: 'wake911!', fullName: 'Dispatcher Ortiz', role: 'emergency_ems', department: 'Wake County 911 Communications' },
      { username: 'ems_captain_davis', password_hint: 'dispatch2026!', fullName: 'Capt. Ronald Davis', role: 'emergency_ems', department: 'Wake County EMS Heat Division' }
    ];
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT username, password_hash, full_name, role, department, badge_number FROM heatshield_users ORDER BY role, id;'
      );
      return res.rows.map(r => ({
        username: r.username,
        password_hint: r.password_hash,
        fullName: r.full_name,
        role: r.role,
        department: r.department,
        badgeNumber: r.badge_number
      }));
    } finally {
      client.release();
    }
  } catch (err) {
    return [];
  }
}

async function saveCommunitySubscription(email, addresses) {
  if (!email || !addresses || !addresses.length) {
    return { success: false, error: 'Email and at least one address are required' };
  }

  if (!pool && !initPool()) return { success: false, error: 'Database not initialized' };

  try {
    const client = await pool.connect();
    try {
      const cleanEmail = email.trim().toLowerCase();
      const addressesJson = JSON.stringify(addresses);

      const res = await client.query(
        `INSERT INTO community_alert_subscriptions (email, addresses, subscribed_at)
         VALUES ($1, $2, NOW())
         RETURNING id, email, addresses, subscribed_at;`,
        [cleanEmail, addressesJson]
      );

      return {
        success: true,
        subscription: res.rows[0],
        message: `Registered ${addresses.length} monitored location(s) for ${cleanEmail}.`
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getCommunitySubscriptions(email) {
  if (!pool && !initPool()) return [];

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT id, email, addresses, subscribed_at FROM community_alert_subscriptions WHERE email = $1 ORDER BY subscribed_at DESC LIMIT 5;',
        [email.trim().toLowerCase()]
      );
      return res.rows;
    } finally {
      client.release();
    }
  } catch (err) {
    return [];
  }
}

module.exports = {
  initPool,
  initSchema,
  ingestLatestReading,
  seedHistorical24h,
  getLatestTelemetry,
  getTimeBucketTrends,
  getDiagnostics,
  RALEIGH_STATIONS,
  authenticateUser,
  getSampleUsers,
  saveCommunitySubscription,
  getCommunitySubscriptions
};
