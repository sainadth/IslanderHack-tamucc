import { configureStore, createSlice } from '@reduxjs/toolkit'

// A lightweight preparedness slice to store user inputs and computed score.
const initialState = {
  household: {
    adults: 1,
    kids: 0,
    elderly: 0,
    pets: 0,
    specialNeeds: false,
  },
  location: {
    zip: '',
    evacuationZone: null,
  },
  medical: {
    needsOxygen: false,
    needsDialysis: false,
    medications: [],
  },
  transport: {
    hasVehicle: true,
    vehiclesAvailable: 1,
  },
  score: 0,
  checklist: [],
  checklistCompleted: {}, // Track which items are completed { itemIndex: boolean }
  notifications: [],
  notificationSettings: {
    email: '',
    phoneNumber: '',
    emailEnabled: true,
    smsEnabled: false,
    hurricaneAlerts: true,
    floodAlerts: true,
    tornadoAlerts: true,
    severeWeatherAlerts: true,
    checklistReminders: true,
  },
  notificationStatus: null, // Server notification status
}

const preparednessSlice = createSlice({
  name: 'preparedness',
  initialState,
  reducers: {
    setHousehold(state, action) {
      state.household = { ...state.household, ...action.payload }
    },
    setLocation(state, action) {
      state.location = { ...state.location, ...action.payload }
    },
    setMedical(state, action) {
      state.medical = { ...state.medical, ...action.payload }
    },
    setTransport(state, action) {
      state.transport = { ...state.transport, ...action.payload }
    },
    setChecklist(state, action) {
      const newChecklist = action.payload
      // Only reset completion if checklist actually changed
      const checklistChanged = JSON.stringify(state.checklist) !== JSON.stringify(newChecklist)
      state.checklist = newChecklist
      if (checklistChanged) {
        // Reset completion tracking only when checklist content changes
        state.checklistCompleted = {}
      }
    },
    toggleChecklistItem(state, action) {
      const index = action.payload
      state.checklistCompleted[index] = !state.checklistCompleted[index]
    },
    setChecklistCompletion(state, action) {
      // Set multiple completions at once: { 0: true, 1: false, ... }
      state.checklistCompleted = { ...state.checklistCompleted, ...action.payload }
    },
    addNotification(state, action) {
      state.notifications.push(action.payload)
    },
    setNotificationSettings(state, action) {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload }
    },
    setNotificationStatus(state, action) {
      state.notificationStatus = action.payload
    },
    calculateScore(state) {
      // Score based on checklist completion percentage (0-100)
      const { checklist, checklistCompleted } = state
      
      if (!Array.isArray(checklist) || checklist.length === 0) {
        // No checklist = starting score of 0
        state.score = 0
        return
      }
      
      // Count completed items
      const totalItems = checklist.length
      const completedCount = Object.values(checklistCompleted).filter(Boolean).length
      const completionPercentage = Math.round((completedCount / totalItems) * 100)
      
      // Score is directly the completion percentage
      state.score = completionPercentage
    },
  },
})

export const {
  setHousehold,
  setLocation,
  setMedical,
  setTransport,
  setChecklist,
  toggleChecklistItem,
  setChecklistCompletion,
  addNotification,
  setNotificationSettings,
  setNotificationStatus,
  calculateScore,
} = preparednessSlice.actions

const store = configureStore({
  reducer: {
    preparedness: preparednessSlice.reducer,
  },
})

export default store
