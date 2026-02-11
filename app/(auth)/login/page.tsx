'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useLocale();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email' || name === 'password') {
      const fieldSchema = loginSchema.shape[name];
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
      } else {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIsLoading(true);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors as Partial<Record<keyof LoginFormData, string>>);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        document.cookie = `session_token=${data.session.token}; path=/;`;
        
        switch(data.user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'dietitian':
            router.push('/dietitian');
            break;
          case 'patient':
          default:
            router.push('/patient');
            break;
        }
      } else {
        const errorData = await response.json();
        setGeneralError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setGeneralError('An error occurred during login');
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
              <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="w-16 h-16 bg-[#facc15]/20 rounded-2xl mx-auto shadow-sm flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#facc15]" />
                </div>
                <h1 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.login.welcomeBack')}</h1>
                {/* <p className="text-slate-500 text-sm">{t('auth.login.signInToAccount')}</p> */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {generalError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{generalError}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.login.emailLabel')}</label>
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
                      placeholder={t('auth.login.emailPlaceholder')}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">{t('auth.login.passwordLabel')}</label>
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
                      placeholder={t('auth.login.passwordPlaceholder')}
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
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 bg-slate-50 border border-slate-300 rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#facc15] border-[#facc15]' : ''}`}>
                      {rememberMe && <Check className="w-3 h-3 text-slate-900" />}
                    </div>
                    <span>{t('auth.login.rememberMe')}</span>
                  </label>
                  <Link href="/forgot-password" className="text-[#facc15] hover:text-[#eab308] transition-colors">
                    {t('auth.login.forgotPassword')}
                  </Link>
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
                      <span>{t('auth.login.signInButton')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center animate-in fade-in duration-700 delay-700">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-slate-500 text-sm">{t('auth.login.orDivider')}</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-900">
                <button className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-all duration-300 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                  </svg>
                  <span>{t('auth.login.continueWithGoogle')}</span>
                </button>
                
                <button className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-all duration-300 flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>{t('auth.login.continueWithGitHub')}</span>
                </button>
              </div>

              <div className="text-center text-sm text-slate-500 animate-in fade-in duration-700 delay-1100">
                {t('auth.login.dontHaveAccount')}
                <Link href="/signup" className="text-[#facc15] hover:text-[#eab308] transition-colors font-medium ml-1">
                  {t('auth.login.signUpLink')}
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-200"></div>

            <div className="hidden lg:flex flex-1 p-8 flex flex-col justify-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 bg-slate-50">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-[#facc15]/20 rounded-3xl flex items-center justify-center border border-slate-200">
                  <Sparkles className="w-[40px] h-[40px] text-[#facc15]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#1e293b] tracking-tight">{t('auth.login.transformJourney')}</h2>
                <p className="text-slate-600 text-base leading-relaxed">{t('auth.login.transformJourneyDesc')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.login.feature1Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.login.feature1Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.login.feature2Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.login.feature2Desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-900">
                  <div className="w-6 h-6 bg-[#facc15]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#facc15]" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-medium">{t('auth.login.feature3Title')}</h3>
                    <p className="text-slate-500 text-sm">{t('auth.login.feature3Desc')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#facc15] rounded-full flex items-center justify-center text-slate-900 font-medium">
                    SC
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-medium text-sm">{t('auth.login.testimonialAuthor')}</h4>
                    <p className="text-slate-500 text-xs">{t('auth.login.testimonialRole')}</p>
                  </div>
                </div>
                <p className="text-sm font-light text-slate-600">"{t('auth.login.testimonialQuote')}"</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1300">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">10K+</div>
                  <div className="text-slate-500 text-xs">{t('auth.login.statsActiveUsers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">500+</div>
                  <div className="text-slate-500 text-xs">{t('auth.login.statsDietitians')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-800">98%</div>
                  <div className="text-slate-500 text-xs">{t('auth.login.statsSatisfaction')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
