// server.js
// Simple config server for IVAC Master Panel dynamic values

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());

// CORS: Browser userscript থেকে কল করবে, তাই * রাখা হল
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Static files (index.html এখন root-এ আছে)
app.use(express.static(__dirname));

// --- In-memory config store ---
let currentConfig = {
  version: 1,
  go_live_at: null, // e.g. "2025-11-16T18:00:05+06:00" (optional)
  data: {
    mobile: '01978442559',
    appointment_date: '2025-11-16',
    app: {
      highcom: '3',
      webfile_id: 'BGDRV9BDA830',
      webfile_id_repeat: 'BGDRV9BDA830',
      ivac_id: '2',
      visa_type: '2',
      family_count: '0'
    },
    family: {
      '1': {
        name: 'SAJJAD',
        webfile_no: 'BGDDV9BDF425',
        again_webfile_no: 'BGDDV9BDF425'
      },
      '2': {
        name: 'TAHSHIN ISLAM ABIR',
        webfile_no: 'BGDDV9BD4625',
        again_webfile_no: 'BGDDV9BD4625'
      },
      '3': {
        name: 'A KHALEK MADBOR',
        webfile_no: 'BGDDV9BDDA25',
        again_webfile_no: 'BGDDV9BDDA25'
      },
      '4': {
        name: 'ABDUL AL MAMUN',
        webfile_no: 'BGDDV9AD3E25',
        again_webfile_no: 'BGDDV9AD3E25'
      }
    }
  }
};

// --- Routes ---

// GET /config → Master Panel এখান থেকে কনফিগ নেবে
app.get('/config', (req, res) => {
  res.json(currentConfig);
});

// POST /config → তুমি এখানে নতুন কনফিগ সাবমিট করবে (UI বা API দিয়ে)
app.post('/config', (req, res) => {
  try {
    const body = req.body || {};
    const {
      mobile,
      appointment_date,
      go_live_at,
      app: appFields,
      family
    } = body;

    if (!mobile || !appointment_date) {
      return res.status(400).json({
        ok: false,
        error: 'mobile and appointment_date are required'
      });
    }

    currentConfig = {
      version: (currentConfig.version || 0) + 1,
      go_live_at: go_live_at || null,
      data: {
        mobile: String(mobile).trim(),
        appointment_date: String(appointment_date).trim(),
        app: {
          highcom: appFields?.highcom || '3',
          webfile_id: appFields?.webfile_id || '',
          webfile_id_repeat: appFields?.webfile_id_repeat || '',
          ivac_id: appFields?.ivac_id || '2',
          visa_type: appFields?.visa_type || '2',
          family_count: appFields?.family_count || '0'
        },
        family: family && typeof family === 'object'
          ? family
          : currentConfig.data.family
      }
    };

    console.log('[IVAC-CONFIG] Updated to version', currentConfig.version);
    res.json({ ok: true, version: currentConfig.version });
  } catch (err) {
    console.error('[IVAC-CONFIG] POST /config error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Fallback → কোনো অন্য রুটে গেলে index.html পাঠাবে
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log('IVAC Config server running on port', PORT);
});
