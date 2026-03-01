import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { VendorService } from '../services/VendorService'
import { useToast } from '../composables/useToast'
import type { Vendor } from '../types/Vendor'

type SortField = 'id' | 'name' | 'contact_person' | 'email' | 'partner_type'
type SortDirection = 'asc' | 'desc'

export const useVendorStore = defineStore('vendor', () => {
  const { show: showToast } = useToast()

  // ============================================
  // STATE
  // ============================================
  const vendors = ref<Vendor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Search
  const searchQuery = ref('')
  const debouncedQuery = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(searchQuery, (val) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = val
    }, 300)
  })

  // Sort
  const sortField = ref<SortField>('id')
  const sortDirection = ref<SortDirection>('desc')

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(10)

  // ============================================
  // COMPUTED
  // ============================================
  const filteredVendors = computed(() => {
    let result = [...vendors.value]

    // Filter by debounced search query
    if (debouncedQuery.value.trim()) {
      const q = debouncedQuery.value.toLowerCase()
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

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredVendors.value.length / pageSize.value)),
  )

  const paginatedVendors = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredVendors.value.slice(start, start + pageSize.value)
  })

  // Reset to page 1 when search or sort changes
  watch([debouncedQuery, sortField, sortDirection], () => {
    currentPage.value = 1
  })

  // ============================================
  // ACTIONS
  // ============================================
  function setSort(field: SortField) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  async function fetchVendors() {
    loading.value = true
    error.value = null
    try {
      vendors.value = await VendorService.getVendors()
    } catch (err) {
      error.value = 'Failed to load vendors. Please try again.'
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
      showToast('Vendor added successfully!', 'success')
    } catch (err) {
      error.value = 'Failed to add vendor. Please try again.'
      showToast('Failed to add vendor.', 'error')
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
      showToast('Vendor deleted successfully.', 'success')
    } catch (err) {
      error.value = 'Failed to delete vendor. Please try again.'
      showToast('Failed to delete vendor.', 'error')
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vendors,
    filteredVendors,
    paginatedVendors,
    loading,
    error,
    searchQuery,
    debouncedQuery,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    totalPages,
    fetchVendors,
    addVendor,
    deleteVendor,
    setSort,
    setPage,
    setPageSize,
  }
})
