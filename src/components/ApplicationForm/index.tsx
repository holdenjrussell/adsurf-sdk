'use client'

import { useState, type FormEvent, type ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface ApplicationField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'url' | 'number'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[] // For select fields
  validation?: (value: string) => string | null // Returns error message or null
}

export interface ApplicationFormProps {
  /** Form title */
  title: string
  /** Form description/subtitle */
  description?: string
  /** Fields to render */
  fields: ApplicationField[]
  /** API endpoint to submit to (relative or absolute) */
  endpoint: string
  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT'
  /** Additional data to include in submission */
  additionalData?: Record<string, unknown>
  /** Submit button text */
  submitLabel?: string
  /** Submitting button text */
  submittingLabel?: string
  /** Success message */
  successMessage?: string
  /** Called on successful submission */
  onSuccess?: (response: unknown) => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Custom header content */
  headerContent?: ReactNode
  /** Custom footer content */
  footerContent?: ReactNode
  /** Custom class name for form container */
  className?: string
  /** Custom styles */
  styles?: {
    container?: string
    title?: string
    description?: string
    field?: string
    label?: string
    input?: string
    button?: string
    error?: string
    success?: string
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ApplicationForm({
  title,
  description,
  fields,
  endpoint,
  method = 'POST',
  additionalData = {},
  submitLabel = 'Submit',
  submittingLabel = 'Submitting...',
  successMessage = 'Your application has been submitted successfully.',
  onSuccess,
  onError,
  headerContent,
  footerContent,
  className = '',
  styles = {},
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((field) => {
      initial[field.name] = ''
    })
    return initial
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateField = (field: ApplicationField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`
    }
    if (field.validation) {
      return field.validation(value)
    }
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }
    if (field.type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        return 'Please enter a valid URL'
      }
    }
    return null
  }

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] || '')
      if (error) {
        errors[field.name] = error
        isValid = false
      }
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateAllFields()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...additionalData,
        }),
      })

      const data = await response.json()

      if (response.ok && (data.success !== false)) {
        setMessage({ type: 'success', text: data.message || successMessage })
        // Reset form
        const resetData: Record<string, string> = {}
        fields.forEach((field) => {
          resetData[field.name] = ''
        })
        setFormData(resetData)
        setFieldErrors({})
        onSuccess?.(data)
      } else {
        const errorText = data.error || data.message || 'Failed to submit form'
        setMessage({ type: 'error', text: errorText })
        onError?.(new Error(errorText))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form'
      setMessage({ type: 'error', text: errorMessage })
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const renderField = (field: ApplicationField) => {
    const baseInputClass = styles.input ||
      'w-full border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
    const errorClass = fieldErrors[field.name] ? 'border-red-500' : ''

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} ${errorClass}`}
          />
        )
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className={`${baseInputClass} ${errorClass}`}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      default:
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        )
    }
  }

  return (
    <div className={styles.container || `bg-white border border-gray-200 p-8 lg:p-12 ${className}`}>
      {headerContent}

      <div className="mb-8 text-center">
        <h1 className={styles.title || 'text-3xl lg:text-4xl font-bold text-gray-900 uppercase'}>
          {title}
        </h1>
        {description && (
          <p className={styles.description || 'text-sm text-gray-500 mt-3'}>
            {description}
          </p>
        )}
      </div>

      {message && (
        <div
          className={
            message.type === 'success'
              ? (styles.success || 'mb-6 p-4 text-sm bg-green-50 border border-green-200 text-green-700')
              : (styles.error || 'mb-6 p-4 text-sm bg-red-50 border border-red-200 text-red-700')
          }
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map((field) => (
          <div key={field.name} className={styles.field}>
            <label className={styles.label || 'block text-sm text-gray-900 mb-2 uppercase font-medium'}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {fieldErrors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.button ||
            'w-full bg-black text-white text-sm uppercase tracking-wider py-4 hover:opacity-90 transition-opacity disabled:opacity-50'
          }
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </form>

      {footerContent}
    </div>
  )
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Pre-configured creator/contractor application form
 */
export function CreatorApplicationForm({
  endpoint,
  title = 'Creator Application',
  description = 'Join our creator program and start earning.',
  onSuccess,
  onError,
  ...props
}: Omit<ApplicationFormProps, 'fields'> & {
  endpoint: string
}) {
  return (
    <ApplicationForm
      title={title}
      description={description}
      endpoint={endpoint}
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel' },
        { name: 'instagram', label: 'Instagram Handle', type: 'text', placeholder: '@username' },
        { name: 'tiktok', label: 'TikTok Handle', type: 'text', placeholder: '@username' },
        { name: 'followers', label: 'Total Followers', type: 'number', placeholder: 'Approximate total' },
        { name: 'message', label: 'Why do you want to partner with us?', type: 'textarea' },
      ]}
      onSuccess={onSuccess}
      onError={onError}
      {...props}
    />
  )
}

/**
 * Pre-configured vendor/wholesale application form
 */
export function VendorApplicationForm({
  endpoint,
  title = 'Vendor Application',
  description = 'Apply to become a wholesale partner.',
  onSuccess,
  onError,
  ...props
}: Omit<ApplicationFormProps, 'fields'> & {
  endpoint: string
}) {
  return (
    <ApplicationForm
      title={title}
      description={description}
      endpoint={endpoint}
      fields={[
        { name: 'businessName', label: 'Business Name', type: 'text', required: true },
        { name: 'contactName', label: 'Contact Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'website', label: 'Website', type: 'url' },
        {
          name: 'businessType',
          label: 'Business Type',
          type: 'select',
          required: true,
          options: [
            { value: 'retail', label: 'Retail Store' },
            { value: 'salon', label: 'Salon/Spa' },
            { value: 'gym', label: 'Gym/Fitness' },
            { value: 'online', label: 'Online Retailer' },
            { value: 'other', label: 'Other' },
          ],
        },
        { name: 'message', label: 'Tell us about your business', type: 'textarea' },
      ]}
      onSuccess={onSuccess}
      onError={onError}
      {...props}
    />
  )
}

/**
 * Simple contact form
 */
export function ContactForm({
  endpoint,
  title = 'Contact Us',
  description = 'We\'d love to hear from you.',
  onSuccess,
  onError,
  ...props
}: Omit<ApplicationFormProps, 'fields'> & {
  endpoint: string
}) {
  return (
    <ApplicationForm
      title={title}
      description={description}
      endpoint={endpoint}
      submitLabel="Send Message"
      submittingLabel="Sending..."
      successMessage="Your message has been sent. We'll get back to you soon."
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ]}
      onSuccess={onSuccess}
      onError={onError}
      {...props}
    />
  )
}

