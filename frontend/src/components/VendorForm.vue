<template>
  <div class="vendor-form">
    <h2>Add New Vendor</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Company name"
        />
      </div>

      <div class="form-group">
        <label for="contactPerson">Contact Person:</label>
        <input
          id="contactPerson"
          v-model="form.contact_person"
          type="text"
          required
          placeholder="Contact person name"
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="contact@example.com"
        />
      </div>

      <div class="form-group">
        <label for="partnerType">Partner Type:</label>
        <select id="partnerType" v-model="form.partner_type" required>
          <option value="Supplier">Supplier</option>
          <option value="Partner">Partner</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Add Vendor' }}
        </button>
        <div v-if="vendorStore.error" class="error-message">
          {{ vendorStore.error }}
        </div>
        <div v-if="success" class="success-message">
          Vendor added successfully!
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useVendorStore } from '../stores/vendorStore'
import type { Vendor } from '../types/Vendor'

const vendorStore = useVendorStore()

const form = reactive<Vendor>({
  name: '',
  contact_person: '',
  email: '',
  partner_type: 'Supplier',
})

const success = ref(false)
const submitting = ref(false) //flag to restrict multiple submissions

const resetForm = () => {
  form.name = ''
  form.contact_person = ''
  form.email = ''
  form.partner_type = 'Supplier'
}

const submitForm = async () => {
  if (submitting.value) return //restrict multiple submissions

  submitting.value = true //set the flag when submission starts
  success.value = false

  try {
    await vendorStore.addVendor({ ...form })
    success.value = true

    // Reset the form after successful submission
    setTimeout(() => {
      resetForm()
      success.value = false
      submitting.value = false // reset the flag after submission is complete
    }, 2000)
  } catch (err) {
    // Error is already handled in the store
    submitting.value = false // reset the flag after error is complete
  }
}
</script>

<style scoped>
.vendor-form {
  max-width: 500px;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-actions {
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
}

.success-message {
  color: #4caf50;
  margin-top: 10px;
}
</style>
