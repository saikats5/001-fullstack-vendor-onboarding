import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { VendorService } from '../services/VendorService'
import type { Vendor } from '../types/Vendor'

type SortField = 'id' | 'name' | 'contact_person' | 'email' | 'partner_type'
type SortDirection = 'asc' | 'desc'

export const useVendorStore = defineStore('vendor', () => {
  const vendors = ref<Vendor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Search and sort state
  const searchQuery = ref('')
  const sortField = ref<SortField>('id')
  const sortDirection = ref<SortDirection>('desc')

  // Filtered + sorted vendors — derived from raw vendors
  const filteredVendors = computed(() => {
    let result = [...vendors.value]

    // Search — case insensitive across all fields
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.contact_person.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.partner_type.toLowerCase().includes(q),
      )
    }

    // Sort
    result.sort((a, b) => {
      const aVal = String(a[sortField.value] ?? '').toLowerCase()
      const bVal = String(b[sortField.value] ?? '').toLowerCase()

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  // Toggle sort — clicking same field reverses direction
  function setSort(field: SortField) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  async function fetchVendors() {
    loading.value = true
    error.value = null

    try {
      vendors.value = await VendorService.getVendors()
    } catch (err) {
      error.value = 'Failed to load vendors. Please try again later.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addVendor(vendor: Vendor) {
    loading.value = true
    error.value = null

    try {
      await VendorService.createVendor(vendor)
      await fetchVendors()
    } catch (err) {
      error.value = 'Failed to add vendor. Please try again later.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteVendor(id: number) {
    loading.value = true
    error.value = null

    try {
      await VendorService.deleteVendor(String(id))
      vendors.value = vendors.value.filter((v) => v.id !== id)
    } catch (err) {
      error.value = 'Failed to delete vendor. Please try again.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vendors,
    filteredVendors,
    loading,
    error,
    searchQuery,
    sortField,
    sortDirection,
    fetchVendors,
    addVendor,
    deleteVendor,
    setSort,
  }
})
