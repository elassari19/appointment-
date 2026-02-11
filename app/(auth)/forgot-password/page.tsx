'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const fieldSchema = (forgotPasswordSchema.shape as Record<string, z.ZodTypeAny>)[name];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIsLoading(true);

    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors as Partial<Record<keyof ForgotPasswordFormData, string>>);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setGeneralError(errorData.error || t('auth.forgotPassword.errorSendEmail'));
      }
    } catch (err) {
      setGeneralError(t('auth.forgotPassword.errorOccurred'));
      console.error(err);
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
                {t('auth.forgotPassword.backToLogin')}
              </Link>

              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-[#facc15]/20 rounded-2xl mx-auto shadow-sm flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#facc15]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.forgotPassword.title')}</h1>
                <p className="text-slate-500 text-sm">{t('auth.forgotPassword.subtitle')}</p>
              </div>

              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  {generalError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{generalError}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">{t('auth.forgotPassword.emailLabel')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                        placeholder={t('auth.forgotPassword.emailPlaceholder')}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex font-medium text-slate-900 bg-[#facc15] rounded-xl py-3 px-4 shadow-sm items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{t('auth.forgotPassword.sendButton')}</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-slate-600 text-sm">{t('auth.forgotPassword.successMessage')}</p>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-slate-500 animate-in fade-in duration-700 delay-700">
                {t('auth.forgotPassword.rememberPassword')}
                <Link href="/login" className="text-[#facc15] hover:text-[#eab308] transition-colors font-medium ml-1">
                  {t('auth.forgotPassword.loginLink')}
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-200"></div>

            <div className="hidden lg:flex flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-slate-50">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.forgotPassword.helpTitle')}</h2>
                <p className="text-slate-600 text-base leading-relaxed">{t('auth.forgotPassword.helpDesc')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.forgotPassword.help1Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.forgotPassword.help1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.forgotPassword.help2Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.forgotPassword.help2Desc')}</p>
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
