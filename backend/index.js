// index.js
const express  = require('express')
const cors     = require('cors')
const multer   = require('multer')
const axios    = require('axios')
const fs       = require('fs')
const path     = require('path')
const FormData = require('form-data')
const sqlite3  = require('sqlite3').verbose()

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// —– SQLite setup —–
const db = new sqlite3.Database(path.join(__dirname,'sensorData.db'), err => {
  if (err) throw err
})
db.run(`
  CREATE TABLE IF NOT EXISTS SensorData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    humidity    REAL NOT NULL,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// —– Sensor POST (ESP → this server) —–
app.post('/sensor', (req, res) => {
  const { temperature, humidity } = req.body
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'temperature & humidity must be numbers' })
  }
  const stmt = db.prepare('INSERT INTO SensorData(temperature,humidity) VALUES(?,?)')
  stmt.run(temperature, humidity, err => {
    if (err) return res.status(500).json({ error: 'db insert failed' })
    res.json({ status: 'ok' })
  })
  stmt.finalize()
})

// —– Fetch recent readings for your dashboard —–
app.get('/sensor-data', (req, res) => {
  db.all(
    'SELECT * FROM SensorData ORDER BY timestamp DESC LIMIT 6',
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'db query failed' })
      res.json(rows)
    }
  )
})

// —– OTA proxy —–
const upload = multer({ dest: path.join(__dirname,'uploads') })
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
      maxBodyLength:    Infinity,
      timeout:          120000
    })
    fs.unlinkSync(req.file.path)
    res.json({ status: 'ota started' })
  } catch (err) {
    fs.unlinkSync(req.file.path)
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${PORT}`)
})
app.get('/', (req, res) => {
  res.send('Backend is running!');
});
