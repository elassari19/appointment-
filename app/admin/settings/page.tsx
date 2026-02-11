'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account and system preferences.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {[
            { id: 'general', label: 'General', icon: 'settings' },
            { id: 'profile', label: 'Profile', icon: 'person' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications' },
            { id: 'security', label: 'Security', icon: 'shield' },
            { id: 'billing', label: 'Billing', icon: 'payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <span className="material-icons-round">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 card-stitch p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    defaultValue="MediCare Clinic"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@medicare.com"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Medical Center Drive, Suite 100, New York, NY 10001"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  DM
                </div>
                <div>
                  <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm transition-all">
                    Change Avatar
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Dr. Mitchell"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@medicare.com"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 987-6543"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'New appointment bookings', checked: true },
                  { label: 'Appointment cancellations', checked: true },
                  { label: 'Patient messages', checked: true },
                  { label: 'System updates', checked: false },
                  { label: 'Marketing emails', checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm transition-all">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Billing Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons-round text-primary-foreground">credit_card</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <button className="text-primary font-semibold text-sm">Edit</button>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground mb-3">Current Plan</h3>
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground">Professional Plan</span>
                      <span className="text-primary font-bold">$99/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Renewed on March 1, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
