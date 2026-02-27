<template>
  <div class="vendor-list">
    <h2>Vendor List</h2>

    <!-- Search bar -->
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

    <div v-if="vendorStore.loading" class="loading">Loading vendors...</div>
    <div v-else-if="vendorStore.error" class="error">
      {{ vendorStore.error }}
    </div>
    <div
      v-else-if="vendorStore.filteredVendors.length === 0"
      class="no-vendors"
    >
      <span v-if="vendorStore.searchQuery">
        No vendors found for "<strong>{{ vendorStore.searchQuery }}</strong
        >"
      </span>
      <span v-else>No vendors found. Add your first vendor!</span>
    </div>

    <table v-else class="vendors-table">
      <thead>
        <tr>
          <th @click="vendorStore.setSort('id')" class="sortable">
            ID <span class="sort-icon">{{ getSortIcon('id') }}</span>
          </th>
          <th @click="vendorStore.setSort('name')" class="sortable">
            Name <span class="sort-icon">{{ getSortIcon('name') }}</span>
          </th>
          <th @click="vendorStore.setSort('contact_person')" class="sortable">
            Contact Person
            <span class="sort-icon">{{ getSortIcon('contact_person') }}</span>
          </th>
          <th @click="vendorStore.setSort('email')" class="sortable">
            Email <span class="sort-icon">{{ getSortIcon('email') }}</span>
          </th>
          <th @click="vendorStore.setSort('partner_type')" class="sortable">
            Partner Type
            <span class="sort-icon">{{ getSortIcon('partner_type') }}</span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vendor in vendorStore.filteredVendors" :key="vendor.id">
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

    <!-- Result count -->
    <div
      v-if="!vendorStore.loading && vendorStore.filteredVendors.length > 0"
      class="result-count"
    >
      Showing {{ vendorStore.filteredVendors.length }} of
      {{ vendorStore.vendors.length }} vendors
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
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendorStore'
import type { Vendor } from '../types/Vendor'

const vendorStore = useVendorStore()

const showConfirm = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deletingId = ref<number | null>(null)

onMounted(() => {
  vendorStore.fetchVendors()
})

// Returns sort icon for a given field
const getSortIcon = (field: string) => {
  if (vendorStore.sortField !== field) return '↕'
  return vendorStore.sortDirection === 'asc' ? '↑' : '↓'
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
  } catch (err) {
    // Error handled in store
  } finally {
    deletingId.value = null
    vendorToDelete.value = null
  }
}
</script>
