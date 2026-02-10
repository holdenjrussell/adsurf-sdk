'use client'

import { useState, useEffect, type ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface TimeSlot {
  id: string
  startTime: string // ISO datetime
  endTime: string   // ISO datetime
  available: boolean
}

export interface EventType {
  id: string
  slug: string
  title: string
  description?: string
  duration: number // minutes
  price?: number
  currency?: string
}

export interface BookingData {
  eventTypeId: string
  slotId: string
  startTime: string
  name: string
  email: string
  phone?: string
  notes?: string
}

export interface BookingWidgetProps {
  /** API base URL for fetching availability and creating bookings */
  apiBaseUrl: string
  /** Optional event type to pre-select */
  eventTypeId?: string
  /** Optional user/team slug for specific availability */
  userSlug?: string
  /** Called when booking is successful */
  onBookingComplete?: (booking: unknown) => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Custom header content */
  headerContent?: ReactNode
  /** Custom footer content */
  footerContent?: ReactNode
  /** Custom class names */
  className?: string
  /** Custom styles */
  styles?: {
    container?: string
    calendar?: string
    timeSlot?: string
    selectedSlot?: string
    form?: string
    button?: string
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BookingWidget({
  apiBaseUrl,
  eventTypeId: preselectedEventTypeId,
  userSlug,
  onBookingComplete,
  onError,
  headerContent,
  footerContent,
  className = '',
  styles = {},
}: BookingWidgetProps) {
  // State
  const [step, setStep] = useState<'eventType' | 'calendar' | 'time' | 'form' | 'confirmation'>('eventType')
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Fetch event types
  useEffect(() => {
    async function fetchEventTypes() {
      try {
        setIsLoading(true)
        const url = userSlug
          ? `${apiBaseUrl}/booking/${userSlug}/event-types`
          : `${apiBaseUrl}/booking/event-types`
        const response = await fetch(url)
        const data = await response.json()
        setEventTypes(data.eventTypes || [])

        // Pre-select if ID provided
        if (preselectedEventTypeId) {
          const preselected = data.eventTypes?.find((et: EventType) => et.id === preselectedEventTypeId)
          if (preselected) {
            setSelectedEventType(preselected)
            setStep('calendar')
          }
        }
      } catch (err) {
        setError('Failed to load event types')
        onError?.(err instanceof Error ? err : new Error('Failed to load event types'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventTypes()
  }, [apiBaseUrl, userSlug, preselectedEventTypeId, onError])

  // Fetch availability when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedEventType) return

    // Capture values for the async function
    const date = selectedDate
    const eventType = selectedEventType

    async function fetchAvailability() {
      try {
        setIsLoading(true)
        const dateStr = date.toISOString().split('T')[0]
        const url = `${apiBaseUrl}/booking/availability?eventTypeId=${eventType.id}&date=${dateStr}`
        const response = await fetch(url)
        const data = await response.json()
        setAvailableSlots(data.slots || [])
        setStep('time')
      } catch (err) {
        setError('Failed to load available times')
        onError?.(err instanceof Error ? err : new Error('Failed to load availability'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedDate, selectedEventType, apiBaseUrl, onError])

  const handleSelectEventType = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setStep('calendar')
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventType || !selectedSlot) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${apiBaseUrl}/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: selectedEventType.id,
          slotId: selectedSlot.id,
          startTime: selectedSlot.startTime,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success !== false) {
        setStep('confirmation')
        onBookingComplete?.(data)
      } else {
        throw new Error(data.error || 'Failed to create booking')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      onError?.(err instanceof Error ? err : new Error('Failed to create booking'))
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    switch (step) {
      case 'calendar':
        setStep('eventType')
        setSelectedEventType(null)
        break
      case 'time':
        setStep('calendar')
        setSelectedDate(null)
        break
      case 'form':
        setStep('time')
        setSelectedSlot(null)
        break
    }
  }

  const renderEventTypeSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select a Service</h2>
      {eventTypes.map((et) => (
        <button
          key={et.id}
          onClick={() => handleSelectEventType(et)}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
        >
          <div className="font-medium">{et.title}</div>
          {et.description && (
            <div className="text-sm text-gray-500 mt-1">{et.description}</div>
          )}
          <div className="text-sm text-gray-600 mt-2">
            {et.duration} minutes
            {et.price && ` • $${et.price}`}
          </div>
        </button>
      ))}
    </div>
  )

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth.year, currentMonth.month)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
      <div className={styles.calendar}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goBack}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold">Select a Date</h2>
          <div />
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const newMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1
              const newYear = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year
              setCurrentMonth({ year: newYear, month: newMonth })
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <span className="font-medium">
            {new Date(currentMonth.year, currentMonth.month).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => {
              const newMonth = currentMonth.month === 11 ? 0 : currentMonth.month + 1
              const newYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year
              setCurrentMonth({ year: newYear, month: newMonth })
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-sm text-gray-500 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for first week */}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const isPast = day < today
            const isSelected = selectedDate?.toDateString() === day.toDateString()

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isPast && handleSelectDate(day)}
                disabled={isPast}
                className={`
                  p-2 text-center rounded-lg transition-colors
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-black text-white hover:bg-black' : ''}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTimeSlots = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Select a Time</h2>
        <div />
      </div>

      <p className="text-gray-600 mb-4">
        {selectedDate && formatDate(selectedDate)}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {availableSlots
          .filter((slot) => slot.available)
          .map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSelectSlot(slot)}
              className={`
                p-3 border rounded-lg text-center transition-colors
                ${selectedSlot?.id === slot.id
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 hover:border-black'
                }
              `}
            >
              {formatTime(slot.startTime)}
            </button>
          ))}
      </div>

      {availableSlots.filter((s) => s.available).length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No available times for this date. Please select another date.
        </p>
      )}
    </div>
  )

  const renderForm = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Your Details</h2>
        <div />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="font-medium">{selectedEventType?.title}</div>
        <div className="text-sm text-gray-600">
          {selectedDate && formatDate(selectedDate)} at {selectedSlot && formatTime(selectedSlot.startTime)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.button ||
            'w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity'
          }
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )

  const renderConfirmation = () => (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">✓</div>
      <h2 className="text-2xl font-semibold mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-4">
        You'll receive a confirmation email shortly.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg text-left">
        <div className="font-medium">{selectedEventType?.title}</div>
        <div className="text-sm text-gray-600">
          {selectedDate && formatDate(selectedDate)} at {selectedSlot && formatTime(selectedSlot.startTime)}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          {formData.name} • {formData.email}
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.container || `bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {headerContent}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading && step === 'eventType' ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          {step === 'eventType' && renderEventTypeSelection()}
          {step === 'calendar' && renderCalendar()}
          {step === 'time' && renderTimeSlots()}
          {step === 'form' && renderForm()}
          {step === 'confirmation' && renderConfirmation()}
        </>
      )}

      {footerContent}
    </div>
  )
}

