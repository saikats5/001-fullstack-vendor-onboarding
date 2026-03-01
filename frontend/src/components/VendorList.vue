<template>
  <div class="vendor-list">
    <h2>Vendor List</h2>

    <!-- Toolbar: search + export -->
    <div class="list-toolbar">
      <div class="search-bar">
        <input
          v-model="vendorStore.searchQuery"
          type="text"
          placeholder="Search by name, email, contact or type..."
          class="search-input"
        />
        <button
          v-if="vendorStore.searchQuery"
          class="search-clear"
          @click="vendorStore.searchQuery = ''"
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>

      <button
        class="export-btn"
        @click="exportCSV"
        :disabled="vendorStore.filteredVendors.length === 0"
        title="Export current results to CSV"
      >
        ⬇ Export CSV
      </button>
    </div>

    <div v-if="vendorStore.loading" class="loading">Loading vendors...</div>
    <div v-else-if="vendorStore.error" class="error">
      {{ vendorStore.error }}
    </div>
    <div
      v-else-if="vendorStore.filteredVendors.length === 0"
      class="no-vendors"
    >
      <span v-if="vendorStore.debouncedQuery">
        No vendors found for "<strong>{{ vendorStore.debouncedQuery }}</strong
        >"
      </span>
      <span v-else>No vendors yet. Add your first vendor!</span>
    </div>

    <table v-else class="vendors-table">
      <thead>
        <tr>
          <th class="sortable" @click="vendorStore.setSort('id')">
            ID <span class="sort-icon">{{ getSortIcon('id') }}</span>
          </th>
          <th class="sortable" @click="vendorStore.setSort('name')">
            Name <span class="sort-icon">{{ getSortIcon('name') }}</span>
          </th>
          <th class="sortable" @click="vendorStore.setSort('contact_person')">
            Contact Person
            <span class="sort-icon">{{ getSortIcon('contact_person') }}</span>
          </th>
          <th class="sortable" @click="vendorStore.setSort('email')">
            Email <span class="sort-icon">{{ getSortIcon('email') }}</span>
          </th>
          <th class="sortable" @click="vendorStore.setSort('partner_type')">
            Partner Type
            <span class="sort-icon">{{ getSortIcon('partner_type') }}</span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vendor in vendorStore.paginatedVendors" :key="vendor.id">
          <td data-label="ID">{{ vendor.id }}</td>
          <td data-label="Name" :title="vendor.name">{{ vendor.name }}</td>
          <td data-label="Contact" :title="vendor.contact_person">
            {{ vendor.contact_person }}
          </td>
          <td data-label="Email" :title="vendor.email">{{ vendor.email }}</td>
          <td data-label="Type">
            <span
              :class="[
                'badge',
                vendor.partner_type === 'Supplier'
                  ? 'badge--supplier'
                  : 'badge--partner',
              ]"
            >
              {{ vendor.partner_type }}
            </span>
          </td>
          <td>
            <button
              class="delete-btn"
              @click="confirmDelete(vendor)"
              :disabled="deletingId === vendor.id"
            >
              {{ deletingId === vendor.id ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="vendorStore.totalPages > 1" class="pagination">
      <div class="pagination-info">
        Page {{ vendorStore.currentPage }} of {{ vendorStore.totalPages }}
      </div>

      <div class="pagination-controls">
        <button
          class="page-btn"
          :disabled="vendorStore.currentPage === 1"
          @click="vendorStore.setPage(1)"
          aria-label="First page"
        >
          «
        </button>

        <button
          class="page-btn"
          :disabled="vendorStore.currentPage === 1"
          @click="vendorStore.setPage(vendorStore.currentPage - 1)"
          aria-label="Previous page"
        >
          ‹
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === vendorStore.currentPage }"
          @click="vendorStore.setPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="page-btn"
          :disabled="vendorStore.currentPage === vendorStore.totalPages"
          @click="vendorStore.setPage(vendorStore.currentPage + 1)"
          aria-label="Next page"
        >
          ›
        </button>

        <button
          class="page-btn"
          :disabled="vendorStore.currentPage === vendorStore.totalPages"
          @click="vendorStore.setPage(vendorStore.totalPages)"
          aria-label="Last page"
        >
          »
        </button>
      </div>

      <div class="page-size-selector">
        <label>Per page:</label>
        <select
          :value="vendorStore.pageSize"
          @change="
            vendorStore.setPageSize(
              Number(($event.target as HTMLSelectElement).value),
            )
          "
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Result count -->
    <div
      v-if="!vendorStore.loading && vendorStore.filteredVendors.length > 0"
      class="result-count"
    >
      Showing
      {{ (vendorStore.currentPage - 1) * vendorStore.pageSize + 1 }}–{{
        Math.min(
          vendorStore.currentPage * vendorStore.pageSize,
          vendorStore.filteredVendors.length,
        )
      }}
      of {{ vendorStore.filteredVendors.length }} vendors
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirm" class="dialog-overlay">
      <div class="dialog">
        <h3>Confirm Delete</h3>
        <p>
          Are you sure you want to delete
          <strong>{{ vendorToDelete?.name }}</strong
          >?
        </p>
        <p class="dialog-subtext">This action cannot be undone.</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="confirm-btn" @click="handleDelete">Yes, Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendorStore'
import { VendorService } from '../services/VendorService'
import type { Vendor } from '../types/Vendor'

const vendorStore = useVendorStore()

const showConfirm = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deletingId = ref<number | null>(null)

onMounted(() => {
  vendorStore.fetchVendors()
})

const getSortIcon = (field: string) => {
  if (vendorStore.sortField !== field) return '↕'
  return vendorStore.sortDirection === 'asc' ? '↑' : '↓'
}

const visiblePages = computed(() => {
  const total = vendorStore.totalPages
  const current = vendorStore.currentPage
  const delta = 2
  const pages: number[] = []
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    pages.push(i)
  }
  return pages
})

const exportCSV = () => {
  VendorService.exportToCSV(vendorStore.filteredVendors)
}

const confirmDelete = (vendor: Vendor) => {
  vendorToDelete.value = vendor
  showConfirm.value = true
}

const cancelDelete = () => {
  vendorToDelete.value = null
  showConfirm.value = false
}

const handleDelete = async () => {
  if (!vendorToDelete.value?.id) return
  deletingId.value = vendorToDelete.value.id
  showConfirm.value = false
  try {
    await vendorStore.deleteVendor(vendorToDelete.value.id)
  } finally {
    deletingId.value = null
    vendorToDelete.value = null
  }
}
</script>
