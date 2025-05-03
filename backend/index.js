const express = require('express')
const cors = require('cors')
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const { Pool } = require('pg') // Replaced sqlite3 with pg

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// —— Neon PostgreSQL setup ——
const pool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_IjJnhGDd96lt@ep-young-morning-a4x0kina-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false } // Required for Neon
})

// Initialize table (runs once on server start)
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS SensorData (
        id SERIAL PRIMARY KEY,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Neon DB connected and table verified')
  } catch (err) {
    console.error('DB initialization failed:', err)
    process.exit(1)
  }
}
initDB()

// —— Sensor POST (ESP → this server) ——
app.post('/sensor', async (req, res) => {
  const { temperature, humidity } = req.body
  
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'temperature & humidity must be numbers' })
  }

  try {
    await pool.query(
      'INSERT INTO SensorData(temperature, humidity) VALUES($1, $2)',
      [temperature, humidity]
    )
    res.json({ status: 'ok' })
  } catch (err) {
    console.error('DB insert error:', err)
    res.status(500).json({ error: 'db insert failed' })
  }
})

// —— Fetch recent readings ——
app.get('/sensor-data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM SensorData ORDER BY timestamp DESC LIMIT 6'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('DB query error:', err)
    res.status(500).json({ error: 'db query failed' })
  }
})

// —— OTA proxy (unchanged) ——
const upload = multer({ dest: path.join(__dirname, 'uploads') })
app.post('/ota-upload', upload.single('firmware'), async (req, res) => {
  const espIp = req.body.espIp
  if (!espIp || !req.file) {
    return res.status(400).json({ error: 'espIp & firmware file required' })
  }

  const otaUrl = `http://${espIp}/update`
  const form = new FormData()
  form.append(
    'firmware',
    fs.createReadStream(req.file.path),
    req.file.originalname
  )

  try {
    await axios.post(otaUrl, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000
    })
    fs.unlinkSync(req.file.path)
    res.json({ status: 'ota started' })
  } catch (err) {
    fs.unlinkSync(req.file.path)
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running with Neon PostgreSQL!')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
