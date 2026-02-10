'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Lock, Users, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['patient', 'dietitian']),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
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
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <p className="text-center text-muted-foreground">Join Nutrison for personalized nutrition</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {generalError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{generalError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`pl-9 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  required
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-9 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-9 pr-9 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
              </div>
              {formData.password.length > 0 && (
                <div className="space-y-1 pt-1">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className={req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">
                    <div className="flex items-center gap-2">
                      <span>Patient</span>
                      <span className="text-xs text-muted-foreground">- For health tracking</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dietitian">
                    <div className="flex items-center gap-2">
                      <span>Dietitian</span>
                      <span className="text-xs text-muted-foreground">- For professionals</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>{' '}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
