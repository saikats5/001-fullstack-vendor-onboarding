import type { Vendor } from '../types/Vendor'

const API_BASE = 'http://localhost:3000/api'

export const VendorService = {
  async getVendors(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE}/vendors`)
    if (!response.ok) throw new Error('Failed to fetch vendors')
    return response.json()
  },

  async createVendor(vendor: Vendor): Promise<Vendor> {
    const response = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create vendor')
    }
    return response.json()
  },

  async deleteVendor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete vendor')
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/vendors/check-email?email=${encodeURIComponent(email)}`,
    )
    if (!response.ok) throw new Error('Failed to check email')
    const data = await response.json()
    return data.exists
  },

  exportToCSV(vendors: Vendor[]): void {
    const headers = ['ID', 'Name', 'Contact Person', 'Email', 'Partner Type']
    const rows = vendors.map((v) => [
      v.id ?? '',
      v.name,
      v.contact_person,
      v.email,
      v.partner_type,
    ])

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  },
}
