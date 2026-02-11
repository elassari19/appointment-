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
        router.push('/login');
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
        <div className="relative bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
          
          <div className="flex flex-col lg:flex-row min-h-[700px]">
            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-[#facc15]/20 rounded-2xl mx-auto shadow-sm flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#facc15]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.signup.createAccount')}</h1>
                <p className="text-slate-500 text-sm">{t('auth.signup.joinSubtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {generalError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{generalError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">{t('auth.signup.firstNameLabel')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.firstName ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                        placeholder={t('auth.signup.firstNamePlaceholder')}
                        required
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">{t('auth.signup.lastNameLabel')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.lastName ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                        placeholder={t('auth.signup.lastNamePlaceholder')}
                        required
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.signup.emailLabel')}</label>
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
                      placeholder={t('auth.signup.emailPlaceholder')}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.signup.passwordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}
                      placeholder={t('auth.signup.passwordPlaceholder')}
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
                  {formData.password.length > 0 && (
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-[#facc15]' : 'text-slate-300'}`} />
                          <span className={req.met ? 'text-slate-700' : 'text-slate-400'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.signup.accountTypeLabel')}</label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className={`w-full py-3 bg-slate-50 border ${errors.role ? 'border-red-500' : 'border-slate-200'} rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 transition-all duration-300`}>
                      <Users className="w-5 h-5 mr-2 text-slate-400" />
                      <SelectValue placeholder={t('auth.signup.accountTypePlaceholder')} className="text-slate-700" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="patient" className="focus:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span>{t('auth.signup.patientType')}</span>
                          <span className="text-xs text-[#facc15]">- {t('auth.signup.patientTypeDesc')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dietitian" className="focus:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span>{t('auth.signup.dietitianType')}</span>
                          <span className="text-xs text-slate-500">- {t('auth.signup.dietitianTypeDesc')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 flex font-medium text-slate-900 bg-[#facc15] rounded-xl py-3 px-4 shadow-sm space-x-2 items-center justify-center"
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

              <div className="text-center text-sm text-slate-500 animate-in fade-in duration-700 delay-700">
                {t('auth.signup.alreadyHaveAccount')}
                <Link href="/login" className="text-[#facc15] hover:text-[#eab308] transition-colors font-medium ml-1">
                  {t('auth.signup.loginLink')}
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-200"></div>

            <div className="flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-slate-50">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-[#facc15]/20 rounded-3xl flex items-center justify-center border border-slate-200">
                  <Sparkles className="w-[40px] h-[40px] text-[#facc15]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.signup.startJourney')}</h2>
                <p className="text-slate-600 text-base leading-relaxed">{t('auth.signup.startJourneyDesc')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.signup.feature1Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.signup.feature1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.signup.feature2Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.signup.feature2Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-900">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.signup.feature3Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.signup.feature3Desc')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#facc15] rounded-full flex items-center justify-center text-slate-900 font-medium">
                    MJ
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-medium text-sm">{t('auth.signup.testimonialAuthor')}</h4>
                    <p className="text-slate-500 text-xs">{t('auth.signup.testimonialRole')}</p>
                  </div>
                </div>
                <p className="text-sm font-light text-slate-600">"{t('auth.signup.testimonialQuote')}"</p>
              </div>

              <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1300">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">98%</div>
                  <div className="text-slate-500 text-xs">{t('auth.signup.statsSuccess')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">50K+</div>
                  <div className="text-slate-500 text-xs">{t('auth.signup.statsMeals')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">24/7</div>
                  <div className="text-slate-500 text-xs">{t('auth.signup.statsSupport')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
