'use client';

import { useState } from 'react';
import { Lock, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const { t } = useLocale();
  const [formData, setFormData] = useState<ChangePasswordFormData>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormData, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = [
    { met: formData.newPassword.length >= 8, text: t('auth.changePassword.passwordReqMin') },
    { met: /[A-Z]/.test(formData.newPassword), text: t('auth.changePassword.passwordReqUpper') },
    { met: /[a-z]/.test(formData.newPassword), text: t('auth.changePassword.passwordReqLower') },
    { met: /[0-9]/.test(formData.newPassword), text: t('auth.changePassword.passwordReqNumber') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setGeneralError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    setIsLoading(true);

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors as Partial<Record<keyof ChangePasswordFormData, string>>);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage(t('auth.changePassword.successMessage'));
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        setGeneralError(errorData.error || t('auth.changePassword.errorChange'));
      }
    } catch (err) {
      setGeneralError(t('auth.changePassword.errorOccurred'));
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
                href="/settings" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-[#facc15] transition-colors animate-in fade-in duration-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('auth.changePassword.backToSettings')}
              </Link>

              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-[#facc15]/20 rounded-2xl mx-auto shadow-sm flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#facc15]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.changePassword.title')}</h1>
                <p className="text-slate-500 text-sm">{t('auth.changePassword.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {generalError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{generalError}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{successMessage}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.changePassword.currentPasswordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.currentPassword ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                      placeholder={t('auth.changePassword.currentPasswordPlaceholder')}
                      required
                    />
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.changePassword.newPasswordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 bg-slate-50 border ${errors.newPassword ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                      placeholder={t('auth.changePassword.newPasswordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.newPassword.length > 0 && (
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-[#facc15]' : 'text-slate-300'}`} />
                          <span className={req.met ? 'text-slate-700' : 'text-slate-400'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.changePassword.confirmPasswordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                      placeholder={t('auth.changePassword.confirmPasswordPlaceholder')}
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex font-medium text-slate-900 bg-[#facc15] rounded-xl py-3 px-4 shadow-sm items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t('auth.changePassword.changeButton')}</span>
                  )}
                </button>
              </form>
            </div>

            <div className="hidden lg:block w-px bg-slate-200"></div>

            <div className="hidden lg:flex flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-slate-50">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.changePassword.tipsTitle')}</h2>
                <p className="text-slate-600 text-base leading-relaxed">{t('auth.changePassword.tipsDesc')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.changePassword.tip1Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.changePassword.tip1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.changePassword.tip2Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.changePassword.tip2Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.changePassword.tip3Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.changePassword.tip3Desc')}</p>
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
