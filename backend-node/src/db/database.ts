import sqlite3 from 'sqlite3'
import { Database } from 'sqlite3'
import path from 'path'
import fs from 'fs'

// Create data directory if it doesn't exist
const dataDir = path.resolve(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'vendors.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err)
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`)
  }
})

// Initialize vendors table
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            partner_type TEXT NOT NULL
        )
    `)

  // Check if data already exists to avoid duplicate inserts on restarts
  db.get(
    'SELECT COUNT(*) as count FROM vendors',
    (err, result: { count: number }) => {
      if (err) {
        console.error('Error checking vendors count:', err)
        return
      }

      // Only insert sample data if the table is empty
      if (result.count === 0) {
        db.run(`
                INSERT INTO vendors (name, contact_person, email, partner_type) VALUES 
                ('Acme Corp', 'John Doe', 'john@acmecorp.com', 'Supplier'),
                ('Globex Inc', 'Jane Smith', 'jane@globex.com', 'Supplier'),
                ('Initech LLC', 'Michael Johnson', 'michael@initech.com', 'Partner'),
                ('Umbrella Corp', 'Sarah Williams', 'sarah@umbrellacorp.com', 'Partner')
            `)
        console.log('Sample vendor data inserted')
      }
    },
  )
})

export default db
