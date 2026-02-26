<template>
  <div class="vendor-list">
    <h2>Vendor List</h2>
    <div v-if="vendorStore.loading" class="loading">Loading vendors...</div>
    <div v-else-if="vendorStore.error" class="error">
      {{ vendorStore.error }}
    </div>
    <div v-else-if="vendorStore.vendors.length === 0" class="no-vendors">
      No vendors found. Add your first vendor!
    </div>
    <table v-else class="vendors-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact Person</th>
          <th>Email</th>
          <th>Partner Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vendor in vendorStore.vendors" :key="vendor.id">
          <td data-label="ID">{{ vendor.id }}</td>
          <td data-label="Name">{{ vendor.name }}</td>
          <td data-label="Contact">{{ vendor.contact_person }}</td>
          <td data-label="Email">{{ vendor.email }}</td>
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
    <!-- Confirmation Dialog - Start -->
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
    <!-- Confirmation Dialog - End -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendorStore'
import type { Vendor } from '../types/Vendor'

// Using the vendor store directly, no need for local props or state
const vendorStore = useVendorStore()

// Deletion state
const showConfirm = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deletingId = ref<number | null>(null)

onMounted(() => {
  vendorStore.fetchVendors()
})

// Execute deletion after confirmation
const confirmDelete = (vendor: Vendor) => {
  vendorToDelete.value = vendor
  showConfirm.value = true
}

// Cancel deletion
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
    // Error
  } finally {
    deletingId.value = null
    vendorToDelete.value = null
  }
}
</script>
