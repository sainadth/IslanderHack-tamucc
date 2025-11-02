import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAuth } from '../firebase/AuthContext';
import { apiService } from '../services/apiService';
import { setNotificationSettings, setNotificationStatus } from '../store/store';
import Header from '../components/Header';

export default function AlertsPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Get notification settings and status from Redux store
  const preferences = useSelector((state) => state.preparedness.notificationSettings);
  const notificationStatus = useSelector((state) => state.preparedness.notificationStatus);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    // Load page immediately without blocking
    setLoading(false);
    
    // Load user preferences synchronously
    loadUserPreferences();
    
    // Check status in background (non-blocking)
    loadNotificationStatus().catch(err => {
      console.log('Could not load notification status:', err.message);
    });
  }, []);

  // Sync email when user logs in/out
  useEffect(() => {
    if (user?.email) {
      dispatch(setNotificationSettings({ email: user.email }));
    }
  }, [user, dispatch]);

  const loadNotificationStatus = async () => {
    try {
      const status = await apiService.getNotificationStatus();
      dispatch(setNotificationStatus(status));
    } catch (error) {
      console.log('Could not load notification status:', error.message);
      // Set a default status when server is unavailable
      dispatch(setNotificationStatus({
        enabled: { email: true, push: true, sms: false },
        ready: { email: false, push: false, sms: false },
        message: '⚠️ Unable to connect to server. Please ensure the backend is running.'
      }));
    }
  };

  const loadUserPreferences = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      const savedPrefs = JSON.parse(saved);
      // Always sync email from current user if logged in
      if (user?.email) {
        savedPrefs.email = user.email;
      }
      dispatch(setNotificationSettings(savedPrefs));
    } else if (user?.email) {
      // No saved preferences, set defaults with user email
      dispatch(setNotificationSettings({ email: user.email }));
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to backend)
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      // Show success message
      toast.success('✅ Notification preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('❌ Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to update preferences
  const updatePreference = (key, value) => {
    dispatch(setNotificationSettings({ [key]: value }));
  };

  const testEmailNotification = async () => {
    if (!user?.email) {
      toast.warning('Please sign in to test email notifications');
      return;
    }

    setTestingEmail(true);
    try {
      await apiService.testEmail(user.email);
      toast.success('✅ Test email sent! Check your inbox.');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('❌ Failed to send test email. Please try again.');
    } finally {
      setTestingEmail(false);
    }
  };

  // Show sign-in prompt if user is not logged in
  if (!user && !loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Sign In Required</h2>
            <p className="text-slate-600 mb-6">
              Please sign in to configure your emergency alert preferences and receive notifications.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading notification settings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Emergency Alerts & Notifications</h1>
            <p className="text-slate-600">Customize how you receive emergency alerts and weather updates</p>
          </div>

          {/* System Status Card */}
          {notificationStatus && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Notification System Status</h2>
                <button
                  onClick={loadNotificationStatus}
                  className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📧</span>
                    <span className="text-slate-700">Email Alerts</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    notificationStatus.ready?.email 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {notificationStatus.ready?.email ? '✅ Ready' : '⚠️ Not Configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl"></span>
                    <span className="text-slate-700">SMS Alerts</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    notificationStatus.ready?.sms 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {notificationStatus.ready?.sms ? '✅ Ready' : '➖ Not Available'}
                  </span>
                </div>
              </div>
              {notificationStatus.message && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {notificationStatus.message}
                </div>
              )}
            </div>
          )}

          {/* Notification Channels */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Notification Channels</h2>
            <div className="space-y-6">
              {/* Email Configuration */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <span className="font-medium text-slate-800">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailEnabled}
                      onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                <p className="text-sm text-slate-600 mb-3 ml-11">Receive emergency alerts and weather updates via email</p>
                <div className="ml-11">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={preferences.email || user?.email || ''}
                    onChange={(e) => updatePreference('email', e.target.value)}
                    disabled={!preferences.emailEnabled}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* SMS Configuration */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">�</span>
                    <span className="font-medium text-slate-800">SMS Text Alerts</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">Beta</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.smsEnabled}
                      onChange={(e) => updatePreference('smsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                <p className="text-sm text-slate-600 mb-3 ml-11">Get critical emergency alerts via SMS text messages</p>
                <div className="ml-11">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={preferences.phoneNumber}
                    onChange={(e) => updatePreference('phoneNumber', e.target.value)}
                    disabled={!preferences.smsEnabled}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {preferences.smsEnabled && !notificationStatus?.ready?.sms && (
                    <p className="text-xs text-amber-600 mt-2">⚠️ SMS service requires additional configuration. Contact support for setup.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Test Notifications</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={testEmailNotification}
                  disabled={!preferences.emailEnabled || testingEmail}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testingEmail ? 'Sending...' : '📧 Test Email'}
                </button>
              </div>
            </div>
          </div>

          {/* Alert Types */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Alert Types</h2>
            <p className="text-sm text-slate-600 mb-4">Choose which types of alerts you want to receive</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.hurricaneAlerts}
                  onChange={(e) => updatePreference('hurricaneAlerts', e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">🌀 Hurricane Alerts</div>
                  <p className="text-sm text-slate-600">Tropical storms, hurricanes, and storm surge warnings</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.floodAlerts}
                  onChange={(e) => updatePreference('floodAlerts', e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">🌊 Flood Alerts</div>
                  <p className="text-sm text-slate-600">Flash floods, coastal flooding, and flood warnings</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.tornadoAlerts}
                  onChange={(e) => updatePreference('tornadoAlerts', e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">🌪️ Tornado Alerts</div>
                  <p className="text-sm text-slate-600">Tornado watches, warnings, and severe thunderstorms</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.severeWeatherAlerts}
                  onChange={(e) => updatePreference('severeWeatherAlerts', e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">⛈️ Severe Weather Alerts</div>
                  <p className="text-sm text-slate-600">High winds, hail, extreme temperatures, and winter storms</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={preferences.checklistReminders}
                  onChange={(e) => updatePreference('checklistReminders', e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">📋 Checklist Reminders</div>
                  <p className="text-sm text-slate-600">Seasonal preparedness reminders and supply checks</p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">About Emergency Alerts</h3>
                <p className="text-sm text-blue-700">
                  Our AI-powered notification system monitors real-time weather data and sends personalized alerts based on your location and household profile. Alerts are customized to your specific needs including family size, pets, medical conditions, and transportation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
