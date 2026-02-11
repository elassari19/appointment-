'use client';

import { useState, useEffect } from 'react';
import { Calendar, Link2, Unlink, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CalendarSyncProps {
  onSyncChange?: (isConnected: boolean) => void;
}

export function CalendarSync({ onSyncChange }: CalendarSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const calendarStatus = params.get('calendar');
      if (calendarStatus === 'success') {
        setSuccess('Google Calendar connected successfully!');
        setIsConnected(true);
        onSyncChange?.(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (calendarStatus === 'error') {
        const message = params.get('message') || 'Failed to connect calendar';
        setError(message);
      }
    }
  }, [onSyncChange]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isAuthenticated);
        onSyncChange?.(data.isAuthenticated);
      }
    } catch (err) {
      console.error('Failed to check calendar connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectCalendar = async () => {
    setIsConnecting(true);
    setError('');
    try {
      const response = await fetch('/api/calendar');
      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          setError('Calendar configuration missing');
        }
      } else {
        setError('Failed to initiate calendar connection');
      }
    } catch (err) {
      setError('Failed to connect calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCalendar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/calendar', {
        method: 'DELETE',
      });
      if (response.ok) {
        setIsConnected(false);
        onSyncChange?.(false);
        setSuccess('Calendar disconnected');
      } else {
        setError('Failed to disconnect calendar');
      }
    } catch (err) {
      setError('Failed to disconnect calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const syncNow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncAll: true }),
      });

      if (response.ok) {
        setSuccess('Calendar synced successfully!');
      } else {
        setError('Failed to sync calendar');
      }
    } catch (err) {
      setError('Failed to sync calendar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#1e293b]">Google Calendar</h3>
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                Not connected
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            {isConnected
              ? 'Your appointments will automatically sync with your Google Calendar.'
              : 'Connect your Google Calendar to automatically sync your appointments.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isConnected ? (
              <>
                <button
                  onClick={syncNow}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#facc15] text-slate-900 font-medium rounded-lg hover:bg-[#eab308] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Sync Now
                </button>
                <button
                  onClick={disconnectCalendar}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectCalendar}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-[#facc15] text-slate-900 font-medium rounded-lg hover:bg-[#eab308] transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
