import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import VendorForm from '../../components/VendorForm.vue'
import { VendorService } from '../../services/VendorService'

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

describe('VendorForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(VendorService.checkEmailExists).mockReset()
    vi.mocked(VendorService.createVendor).mockReset()
    vi.mocked(VendorService.getVendors).mockReset()
  })

  const mountForm = () =>
    mount(VendorForm, {
      global: { plugins: [createPinia()] },
    })

  // ============================================
  // RENDERING
  // ============================================
  it('renders all form fields', () => {
    const wrapper = mountForm()
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('submit button is enabled initially', () => {
    const wrapper = mountForm()
    expect(
      wrapper.find('button[type="submit"]').attributes('disabled'),
    ).toBeUndefined()
  })

  it('defaults partner_type select to Supplier', () => {
    const wrapper = mountForm()
    const select = wrapper.find('select')
    expect((select.element as HTMLSelectElement).value).toBe('Supplier')
  })

  // ============================================
  // SUBMISSION
  // ============================================
  it('calls createVendor with correct payload on valid submit', async () => {
    vi.mocked(VendorService.checkEmailExists).mockResolvedValue(false)
    vi.mocked(VendorService.createVendor).mockResolvedValue({
      id: 1,
      name: 'Test Vendor',
    } as any)
    vi.mocked(VendorService.getVendors).mockResolvedValue([])

    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Test Vendor')
    await inputs[1].setValue('Test Person')
    await inputs[2].setValue('test@company.com')
    await wrapper.find('select').setValue('Partner')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(VendorService.createVendor).toHaveBeenCalledWith({
      name: 'Test Vendor',
      contact_person: 'Test Person',
      email: 'test@company.com',
      partner_type: 'Partner',
    })
  })

  it('shows error when duplicate email is entered', async () => {
    vi.mocked(VendorService.checkEmailExists).mockResolvedValue(true)
    vi.mocked(VendorService.getVendors).mockResolvedValue([])

    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Test Vendor')
    await inputs[1].setValue('Test Person')
    await inputs[2].setValue('test@exists.com')
    await wrapper.find('select').setValue('Supplier')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('already exists')
    expect(VendorService.createVendor).not.toHaveBeenCalled()
  })

  // ============================================
  // DUPLICATE SUBMIT PREVENTION
  // ============================================
  it('disables submit button while submitting', async () => {
    vi.mocked(VendorService.checkEmailExists).mockResolvedValue(false)

    let resolve: (v: any) => void = () => {}
    vi.mocked(VendorService.createVendor).mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    vi.mocked(VendorService.getVendors).mockResolvedValue([])

    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Test Vendor')
    await inputs[1].setValue('Test Person')
    await inputs[2].setValue('unique@company.com')
    await wrapper.find('select').setValue('Supplier')

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(
      wrapper.find('button[type="submit"]').attributes('disabled'),
    ).toBeDefined()

    resolve({ id: 1, name: 'Test Vendor' })
  })

  it('does not submit twice when clicked rapidly', async () => {
    vi.mocked(VendorService.checkEmailExists).mockResolvedValue(false)
    vi.mocked(VendorService.createVendor).mockResolvedValue({
      id: 1,
      name: 'Test',
    } as any)
    vi.mocked(VendorService.getVendors).mockResolvedValue([])

    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Test Vendor')
    await inputs[1].setValue('Test Person')
    await inputs[2].setValue('test@company.com')
    await wrapper.find('select').setValue('Supplier')

    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(VendorService.createVendor).toHaveBeenCalledTimes(1)
  })
})
