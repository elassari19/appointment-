'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Calendar, Camera, Shield, 
  CheckCircle2, AlertCircle, Loader2, Edit3, Save, X,
  FileText, Clock, Award, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
  });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me/');
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        const userData = data.user;
        
        if (!userData) {
          setAlert({ type: 'error', message: 'No user data received' });
          setLoading(false);
          return;
        }
        
        setProfile(userData);
        
        // Handle dateOfBirth - it could be a Date object or ISO string
        let formattedDateOfBirth = '';
        if (userData.dateOfBirth) {
          const dateStr = typeof userData.dateOfBirth === 'string' 
            ? userData.dateOfBirth 
            : userData.dateOfBirth.toISOString ? userData.dateOfBirth.toISOString() : String(userData.dateOfBirth);
          formattedDateOfBirth = dateStr.split('T')[0];
        }
        
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          dateOfBirth: formattedDateOfBirth,
          bio: userData.bio || '',
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch profile:', errorData);
        setAlert({ type: 'error', message: errorData.error || 'Failed to load profile' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAlert({ type: 'error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const response = await fetch('/api/auth/me/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setAlert({ type: 'success', message: 'Profile updated successfully' });
        setIsEditing(false);
        setTimeout(() => setAlert(null), 3000);
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'Image size should be less than 5MB' });
      return;
    }

    setUploading(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/auth/me/', {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, profilePicture: data.url } : null);
        setAlert({ type: 'success', message: 'Profile picture updated successfully' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        const error = await response.json();
        setAlert({ type: 'error', message: error.error || 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlert({ type: 'error', message: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
    setAlert(null);
  };

  const getInitials = () => {
    if (!profile) return '';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    if (passwordData.newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setPasswordErrors({ newPassword: 'Password must contain at least one uppercase letter' });
      return;
    }
    if (!/[a-z]/.test(passwordData.newPassword)) {
      setPasswordErrors({ newPassword: 'Password must contain at least one lowercase letter' });
      return;
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      setPasswordErrors({ newPassword: 'Password must contain at least one number' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordErrors({ newPassword: 'New password must be different from current password' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordOpen(false);
        setTimeout(() => setAlert(null), 3000);
      } else {
        const errorData = await response.json();
        setPasswordErrors({ general: errorData.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ general: 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-5 w-72 bg-slate-100 rounded-xl mt-3 animate-pulse"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl bg-slate-100 animate-pulse"></div>
                <div className="h-6 w-32 bg-slate-100 rounded-xl mt-4 animate-pulse"></div>
                <div className="h-4 w-20 bg-slate-100 rounded-xl mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="h-6 w-40 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="grid md:grid-cols-2 gap-5 mt-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b]">My Profile</h1>
        <p className="text-slate-500 mt-1.5 text-base">Manage your personal information and account settings</p>
      </div>

      {/* Alert Messages */}
      {alert && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
          alert.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-100' 
            : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-100'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cover Image */}
            <div className="h-36 bg-gradient-to-br from-[#facc15] via-amber-400 to-yellow-300 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-50"></div>
            </div>
            
            {/* Profile Info */}
            <div className="px-6 pb-6 -mt-14 relative">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-xl border-4 border-white">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {profile?.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-slate-400">
                        {getInitials()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 p-2.5 bg-[#facc15] text-slate-900 rounded-xl shadow-lg hover:bg-[#eab308] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="mt-4">
                <h2 className="text-xl font-bold text-[#1e293b]">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-slate-500 capitalize font-medium">{profile?.role}</p>
                
                {profile?.isVerified && (
                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                    <Shield className="w-4 h-4" />
                    Verified Account
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Member Since</span>
                  </div>
                  <p className="font-semibold text-[#1e293b] text-sm">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Status</span>
                  </div>
                  <p className={`font-semibold text-sm ${profile?.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-[#1e293b] mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#facc15]/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-[#facc15]" />
              </div>
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400 mb-1 font-medium">Email Address</p>
                <p className="font-medium text-[#1e293b] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {profile?.email}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400 mb-1 font-medium">Phone Number</p>
                <p className="font-medium text-[#1e293b] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {profile?.phone || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400 mb-1 font-medium">Date of Birth</p>
                <p className="font-medium text-[#1e293b] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {profile?.dateOfBirth 
                    ? formatDate(profile.dateOfBirth)
                    : <span className="text-slate-400 italic">Not provided</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-[#1e293b] flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#facc15]/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-[#facc15]" />
                </div>
                Personal Information
              </h3>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="gap-2 rounded-xl border-slate-200"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="gap-2 rounded-xl bg-[#facc15] text-slate-900 hover:bg-[#eab308] font-medium px-5"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div className="space-y-2.5">
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-11 rounded-xl ${!isEditing ? 'bg-slate-50 border-slate-100' : 'border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20'}`}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2.5">
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-11 rounded-xl ${!isEditing ? 'bg-slate-50 border-slate-100' : 'border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20'}`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="h-11 rounded-xl bg-slate-50 border-slate-100 text-slate-500"
                    />
                    <p className="text-xs text-slate-400 ml-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-11 rounded-xl ${!isEditing ? 'bg-slate-50 border-slate-100' : 'border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20'}`}
                      placeholder="+966 50 123 4567"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2.5">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`h-11 rounded-xl ${!isEditing ? 'bg-slate-50 border-slate-100' : 'border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20'}`}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2.5">
                  <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
                    About Me
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-xl min-h-[140px] resize-none ${!isEditing ? 'bg-slate-50 border-slate-100' : 'border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20'}`}
                    placeholder="Tell us a bit about yourself..."
                  />
                  <p className="text-xs text-slate-400 ml-1">
                    Brief description for your profile. This will be visible to healthcare providers.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-[#1e293b] mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#facc15]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#facc15]" />
              </div>
              Account Security
            </h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-[#1e293b]">Password</p>
                  <p className="text-sm text-slate-500">Last updated 3 months ago</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                onClick={() => setPasswordOpen(true)}
              >
                <Award className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
        <SheetContent className="w-[400px] sm:max-w-[580px] p-8">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#facc15]/20 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#facc15]" />
              </div>
              <div>
                <SheetTitle className="text-xl font-semibold text-[#1e293b]">Change Password</SheetTitle>
                <p className="text-sm text-slate-500 mt-0.5">Update your password to keep your account secure</p>
              </div>
            </div>
          </SheetHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {passwordErrors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordErrors.general}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">Current Password</Label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-l-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 bg-slate-50"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New Password</Label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-l-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 bg-slate-50"
                  placeholder="Create new password"
                  required
                />
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 ml-1">{passwordErrors.newPassword}</p>
              )}
              {passwordData.newPassword && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordData.newPassword.length >= 8 ? 'bg-[#facc15]/20' : 'bg-slate-100'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${passwordData.newPassword.length >= 8 ? 'text-[#facc15]' : 'text-slate-300'}`} />
                    </div>
                    <span className={passwordData.newPassword.length >= 8 ? 'text-slate-700' : 'text-slate-400'}>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-[#facc15]/20' : 'bg-slate-100'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-[#facc15]' : 'text-slate-300'}`} />
                    </div>
                    <span className={/[A-Z]/.test(passwordData.newPassword) ? 'text-slate-700' : 'text-slate-400'}>Uppercase</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[a-z]/.test(passwordData.newPassword) ? 'bg-[#facc15]/20' : 'bg-slate-100'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[a-z]/.test(passwordData.newPassword) ? 'text-[#facc15]' : 'text-slate-300'}`} />
                    </div>
                    <span className={/[a-z]/.test(passwordData.newPassword) ? 'text-slate-700' : 'text-slate-400'}>Lowercase</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[0-9]/.test(passwordData.newPassword) ? 'bg-[#facc15]/20' : 'bg-slate-100'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(passwordData.newPassword) ? 'text-[#facc15]' : 'text-slate-300'}`} />
                    </div>
                    <span className={/[0-9]/.test(passwordData.newPassword) ? 'text-slate-700' : 'text-slate-400'}>Number</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-l-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 bg-slate-50"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 ml-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50"
                onClick={() => setPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#facc15] text-slate-900 hover:bg-[#eab308] font-medium"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
