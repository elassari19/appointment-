'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Users, ArrowRight, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['patient', 'dietitian']),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { t } = useLocale();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'patient',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateField = (name: keyof SignupFormData, value: string) => {
    const fieldSchema = signupSchema.shape[name];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof SignupFormData, value);
  };

  const handleRoleChange = (value: 'patient' | 'dietitian') => {
    setFormData(prev => ({ ...prev, role: value }));
    setErrors(prev => ({ ...prev, role: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIsLoading(true);

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors as Partial<Record<keyof SignupFormData, string>>);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/auth/login');
      } else {
        const errorData = await response.json();
        setGeneralError(errorData.error || 'Signup failed');
      }
    } catch (err) {
      setGeneralError('An error occurred during signup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: t('auth.signup.passwordReqMin') },
    { met: /[A-Z]/.test(formData.password), text: t('auth.signup.passwordReqUpper') },
    { met: /[a-z]/.test(formData.password), text: t('auth.signup.passwordReqLower') },
    { met: /[0-9]/.test(formData.password), text: t('auth.signup.passwordReqNumber') },
  ];

  return (
    <div>
      <div className="relative w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row min-h-[700px]">
            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mx-auto shadow-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-light text-white tracking-tight uppercase">{t('auth.signup.createAccount')}</h1>
                <p className="text-white/70 text-sm">{t('auth.signup.joinSubtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {generalError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{generalError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90 block">{t('auth.signup.firstNameLabel')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-white/50" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.firstName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-300`}
                        placeholder={t('auth.signup.firstNamePlaceholder')}
                        required
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90 block">{t('auth.signup.lastNameLabel')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white/10 border ${errors.lastName ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-300`}
                        placeholder={t('auth.signup.lastNamePlaceholder')}
                        required
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 block">{t('auth.signup.emailLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-white/50" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-300`}
                      placeholder={t('auth.signup.emailPlaceholder')}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 block">{t('auth.signup.passwordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-white/50" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${errors.password ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-300`}
                      placeholder={t('auth.signup.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password.length > 0 && (
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-green-400' : 'text-white/30'}`} />
                          <span className={req.met ? 'text-green-400' : 'text-white/50'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 block">{t('auth.signup.accountTypeLabel')}</label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className={`w-full py-3 bg-white/10 border ${errors.role ? 'border-red-500' : 'border-white/20'} rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-300`}>
                      <Users className="w-5 h-5 mr-2 text-white/50" />
                      <SelectValue placeholder={t('auth.signup.accountTypePlaceholder')} className="text-white/80" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="patient" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <span>{t('auth.signup.patientType')}</span>
                          <span className="text-xs text-orange-400">- {t('auth.signup.patientTypeDesc')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dietitian" className="focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <span>{t('auth.signup.dietitianType')}</span>
                          <span className="text-xs text-pink-400">- {t('auth.signup.dietitianTypeDesc')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-red-400">{errors.role}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl py-3 px-4 shadow-lg space-x-2 items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t('auth.signup.createButton')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-sm text-white/70 animate-in fade-in duration-700 delay-700">
                  {t('auth.signup.alreadyHaveAccount')}
                  <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 transition-colors font-medium ml-1">
                    {t('auth.signup.loginLink')}
                  </Link>
                </div>
            </div>

            <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

            <div className="flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-gradient-to-br from-orange-500/10 to-pink-500/10">
<div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-[40px] h-[40px] text-orange-300" />
                  </div>
                  <h2 className="text-4xl font-light text-white tracking-tight">{t('auth.signup.startJourney')}</h2>
                  <p className="text-white/70 text-lg leading-relaxed">{t('auth.signup.startJourneyDesc')}</p>
                </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('auth.signup.feature1Title')}</h3>
                    <p className="text-white/60 text-sm">{t('auth.signup.feature1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('auth.signup.feature2Title')}</h3>
                    <p className="text-white/60 text-sm">{t('auth.signup.feature2Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-900">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('auth.signup.feature3Title')}</h3>
                    <p className="text-white/60 text-sm">{t('auth.signup.feature3Desc')}</p>
                  </div>
                </div>
              </div>

<div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
                      MJ
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{t('auth.signup.testimonialAuthor')}</h4>
                      <p className="text-white/60 text-xs">{t('auth.signup.testimonialRole')}</p>
                    </div>
                  </div>
                  <p className="text-sm font-light text-white/80">"{t('auth.signup.testimonialQuote')}"</p>
                </div>

              <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1300">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-white">98%</div>
                    <div className="text-white/60 text-xs">{t('auth.signup.statsSuccess')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-white">50K+</div>
                    <div className="text-white/60 text-xs">{t('auth.signup.statsMeals')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-white">24/7</div>
                    <div className="text-white/60 text-xs">{t('auth.signup.statsSupport')}</div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-600/20 to-pink-600/20 blur-3xl"></div>
      </div>
    </div>
  );
}
