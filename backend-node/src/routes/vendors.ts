import { Router, Request, Response } from 'express'
import db from '../db/database'
import { Vendor } from '../models/Vendor'

const router = Router()

// GET /vendors - List all vendors
router.get('/', (req: Request, res: Response) => {
  db.all('SELECT * FROM vendors', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

// POST /vendors - Register a new vendor
router.post('/', (req: Request, res: Response) => {
  const { name, contact_person, email, partner_type } = req.body as Vendor

  if (!name || !contact_person || !email || !partner_type) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (partner_type !== 'Supplier' && partner_type !== 'Partner') {
    return res
      .status(400)
      .json({ error: 'partner_type must be either "Supplier" or "Partner"' })
  }

  const sql = `INSERT INTO vendors (name, contact_person, email, partner_type) 
                 VALUES (?, ?, ?, ?)`

  db.run(sql, [name, contact_person, email, partner_type], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.status(201).json({
      id: this.lastID,
      name,
      contact_person,
      email,
      partner_type,
    })
  })
})

// DELETE /vendors/:id - Delete a vendor
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params

  //vendor existence check before deletion to return 500/404, if vendor doesn't exist instead of 200 with no deletion
  db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (!row) {
      return res.status(404).json({ error: 'Vendor unavailable' })
    }

    // Vendor deletion
    db.run('DELETE FROM vendors WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.status(200).json({ message: `Vendor ${id} deleted successfully` })
    })
  })
})

export default router
