'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  appointmentReminders: boolean;
  reminderHoursBefore: number;
  marketingEmails: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    appointmentReminders: true,
    reminderHoursBefore: 24,
    marketingEmails: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        setSuccess('Preferences saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#facc15]" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-[#1e293b] mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5 text-[#facc15]" />
        Notification Preferences
      </h3>

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-[#1e293b]">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive notifications via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailEnabled}
              onChange={(e) => updatePreferences({ emailEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#facc15]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-[#1e293b]">SMS Notifications</p>
              <p className="text-sm text-slate-500">Receive notifications via text message</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.smsEnabled}
              onChange={(e) => updatePreferences({ smsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#facc15]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
          </label>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h4 className="font-medium text-[#1e293b] mb-4">Appointment Reminders</h4>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#facc15]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#facc15]" />
              </div>
              <div>
                <p className="font-medium text-[#1e293b]">Enable Reminders</p>
                <p className="text-sm text-slate-500">Get notified before appointments</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appointmentReminders}
                onChange={(e) => updatePreferences({ appointmentReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#facc15]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
            </label>
          </div>

          {preferences.appointmentReminders && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Remind me before appointment
              </label>
              <select
                value={preferences.reminderHoursBefore}
                onChange={(e) => updatePreferences({ reminderHoursBefore: parseInt(e.target.value) })}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#facc15]/50"
              >
                <option value={1}>1 hour before</option>
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={24}>24 hours before</option>
                <option value={48}>2 days before</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h4 className="font-medium text-[#1e293b] mb-4">Marketing</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#1e293b]">Marketing Emails</p>
              <p className="text-sm text-slate-500">Receive updates about new features and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketingEmails}
                onChange={(e) => updatePreferences({ marketingEmails: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#facc15]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#facc15]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
