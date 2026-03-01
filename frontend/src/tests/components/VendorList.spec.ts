import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import VendorList from '../../components/VendorList.vue'
import { useVendorStore } from '../../stores/vendorStore'
import { VendorService } from '../../services/VendorService'
import type { Vendor } from '../../types/Vendor'

vi.mock('../../services/VendorService', () => ({
  VendorService: {
    getVendors: vi.fn(),
    createVendor: vi.fn(),
    deleteVendor: vi.fn(),
    checkEmailExists: vi.fn(),
    exportToCSV: vi.fn(),
  },
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    show: vi.fn(),
    remove: vi.fn(),
    toasts: { value: [] },
  }),
}))

const mockVendors: Vendor[] = [
  {
    id: 1,
    name: 'Acme Corp',
    contact_person: 'John Doe',
    email: 'john@acme.com',
    partner_type: 'Supplier',
  },
  {
    id: 2,
    name: 'Globex Inc',
    contact_person: 'Jane Smith',
    email: 'jane@globex.com',
    partner_type: 'Partner',
  },
  {
    id: 3,
    name: 'Initech LLC',
    contact_person: 'Bob Jones',
    email: 'bob@initech.com',
    partner_type: 'Supplier',
  },
]

describe('VendorList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(VendorService.getVendors).mockReset()
    vi.mocked(VendorService.deleteVendor).mockReset()
  })

  const mountList = () =>
    mount(VendorList, {
      global: { plugins: [createPinia()] },
    })

  // ============================================
  // RENDERING
  // ============================================
  it('shows loading state initially', async () => {
    vi.mocked(VendorService.getVendors).mockReturnValue(new Promise(() => {}))
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    // Verify the store triggered fetchVendors and is in loading state
    const store = useVendorStore()
    expect(store.loading).toBe(true)
  })

  it('renders vendor rows after fetch', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Acme Corp')
    expect(wrapper.text()).toContain('Globex Inc')
  })

  it('shows empty state when no vendors', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue([])
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No vendors')
  })

  it('shows error state on fetch failure', async () => {
    vi.mocked(VendorService.getVendors).mockRejectedValue(
      new Error('Network error'),
    )
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Failed')
  })

  // ============================================
  // SEARCH
  // ============================================
  it('renders search input', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('filters vendors when debouncedQuery is set', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const store = useVendorStore()
    store.debouncedQuery = 'Acme'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Acme Corp')
    expect(wrapper.text()).not.toContain('Globex Inc')
  })

  it('shows no-result message when search has no matches', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const store = useVendorStore()
    store.debouncedQuery = 'xyznonexistent'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No vendors found')
  })

  // ============================================
  // SORT
  // ============================================
  it('renders sortable column headers', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const sortableThs = wrapper.findAll('th.sortable')
    expect(sortableThs.length).toBeGreaterThan(0)
  })

  it('calls setSort when a sortable header is clicked', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const store = useVendorStore()
    const sortSpy = vi.spyOn(store, 'setSort')
    const firstSortable = wrapper.find('th.sortable')
    await firstSortable.trigger('click')

    expect(sortSpy).toHaveBeenCalled()
  })

  // ============================================
  // DELETE
  // ============================================
  it('shows confirmation dialog when delete is clicked', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const deleteBtn = wrapper.find('.delete-btn')
    await deleteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.dialog-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Confirm Delete')
  })

  it('cancels delete when cancel button is clicked', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    await wrapper.find('.delete-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dialog-overlay').exists()).toBe(true)

    await wrapper.find('.cancel-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dialog-overlay').exists()).toBe(false)
  })

  it('calls deleteVendor and removes vendor on confirm', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    vi.mocked(VendorService.deleteVendor).mockResolvedValue(undefined)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    await wrapper.find('.delete-btn').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('.confirm-btn').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(VendorService.deleteVendor).toHaveBeenCalled()
  })

  // ============================================
  // EXPORT
  // ============================================
  it('renders export button', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.export-btn').exists()).toBe(true)
  })

  it('export button is disabled when no vendors', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue([])
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const exportBtn = wrapper.find('.export-btn')
    expect(exportBtn.attributes('disabled')).toBeDefined()
  })

  it('calls exportToCSV when export button is clicked', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    vi.mocked(VendorService.exportToCSV).mockImplementation(() => {})
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    await wrapper.find('.export-btn').trigger('click')
    expect(VendorService.exportToCSV).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 1 })]),
    )
  })

  // ============================================
  // PAGINATION
  // ============================================
  it('shows pagination when totalPages > 1', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const store = useVendorStore()
    store.setPageSize(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.pagination').exists()).toBe(true)
  })

  it('does not show pagination when all vendors fit on one page', async () => {
    vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
    const wrapper = mountList()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.pagination').exists()).toBe(false)
  })
})
