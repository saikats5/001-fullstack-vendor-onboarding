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
          :class="{ 'input-error': emailError }"
          @input="emailError = ''"
        />
        <div v-if="emailError" class="field-error">{{ emailError }}</div>
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
import { VendorService } from '../services/VendorService'
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
const emailError = ref('') //flag to check email error existence

const resetForm = () => {
  form.name = ''
  form.contact_person = ''
  form.email = ''
  form.partner_type = 'Supplier'
  emailError.value = '' //reset email error when form is reset
}

const submitForm = async () => {
  if (submitting.value) return //restrict multiple submissions

  submitting.value = true //set the flag when submission starts
  success.value = false
  emailError.value = '' //reset email error before submission

  try {
    //check email existence before calling store action to provide faster feedback to user
    const emailExists = await VendorService.checkEmailExists(form.email)
    if (emailExists) {
      emailError.value =
        'A vendor with this email id already exists. Please use a different email id.'
      submitting.value = false
      return
    }
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

.input-error {
  border-color: #f44336;
  outline-color: #f44336;
}

.field-error {
  color: #f44336;
  font-size: 13px;
  margin-top: 4px;
}
</style>
