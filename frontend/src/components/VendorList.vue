<template>
  <div class="vendor-list">
    <h2>Vendor List</h2>
    <div v-if="vendorStore.loading">Loading vendors...</div>
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
          <td>{{ vendor.id }}</td>
          <td>{{ vendor.name }}</td>
          <td>{{ vendor.contact_person }}</td>
          <td>{{ vendor.email }}</td>
          <td>{{ vendor.partner_type }}</td>
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

<style scoped>
.vendor-list {
  position: relative;
  margin: 20px 0;
}

.vendors-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.vendors-table th,
.vendors-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.vendors-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.vendors-table tr:hover {
  background-color: #f5f5f5;
}

/* Delete Button */
.delete-btn {
  padding: 5px 12px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #c62828;
}

.delete-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Confirmation Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.dialog p {
  margin-bottom: 8px;
  color: #333;
}

.dialog-subtext {
  font-size: 13px;
  color: #999;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.cancel-btn {
  padding: 8px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.confirm-btn {
  padding: 8px 20px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn:hover {
  background-color: #c62828;
}

.error {
  color: red;
  padding: 10px;
}

.no-vendors {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
