'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';

export default function VerifyEmailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || t('auth.verifyEmail.errorOccurred'));
        setStatus('error');
      }
    } catch (err) {
      setErrorMessage(t('auth.verifyEmail.errorOccurred'));
      setStatus('error');
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });

      if (response.ok) {
        alert(t('auth.resendVerification.successMessage'));
      } else {
        alert(t('auth.resendVerification.errorOccurred'));
      }
    } catch (err) {
      alert(t('auth.resendVerification.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="relative w-full max-w-sm sm:max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
          
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-[#facc15] transition-colors animate-in fade-in duration-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('auth.verifyEmail.backToLogin')}
              </Link>

              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-[#facc15]/20 rounded-2xl mx-auto shadow-sm flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#facc15]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.verifyEmail.title')}</h1>
                <p className="text-slate-500 text-sm">{t('auth.verifyEmail.subtitle')}</p>
              </div>

              {status === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Loader2 className="w-8 h-8 animate-spin text-[#facc15]" />
                  <p className="text-slate-500 text-sm">{t('auth.login.loading')}</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-2">{t('auth.verifyEmail.successTitle')}</h2>
                    <p className="text-slate-600 text-sm">{t('auth.verifyEmail.successDesc')}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-2">{t('auth.verifyEmail.errorTitle')}</h2>
                    <p className="text-slate-600 text-sm mb-4">{t('auth.verifyEmail.errorDesc')}</p>
                    {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                  </div>

                  <button
                    onClick={resendVerification}
                    disabled={isLoading}
                    className="w-full hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex font-medium text-slate-900 bg-[#facc15] rounded-xl py-3 px-4 shadow-sm items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>{t('auth.verifyEmail.resendButton')}</span>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {status === 'resend' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-2">{t('auth.resendVerification.title')}</h2>
                    <p className="text-slate-600 text-sm">{t('auth.resendVerification.subtitle')}</p>
                  </div>

                  <button
                    onClick={resendVerification}
                    disabled={isLoading}
                    className="w-full hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex font-medium text-slate-900 bg-[#facc15] rounded-xl py-3 px-4 shadow-sm items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>{t('auth.resendVerification.sendButton')}</span>
                      </div>
                    )}
                  </button>
                </div>
              )}

              <div className="text-center text-sm text-slate-500 animate-in fade-in duration-700 delay-700">
                {t('auth.resendVerification.rememberPassword')}
                <Link href="/login" className="text-[#facc15] hover:text-[#eab308] transition-colors font-medium ml-1">
                  {t('auth.resendVerification.loginLink')}
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-200"></div>

            <div className="hidden lg:flex flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-slate-50">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.verifyEmail.helpTitle')}</h2>
                <p className="text-slate-600 text-base leading-relaxed">{t('auth.verifyEmail.helpDesc')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.verifyEmail.feature1Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.verifyEmail.feature1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.verifyEmail.feature2Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.verifyEmail.feature2Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
