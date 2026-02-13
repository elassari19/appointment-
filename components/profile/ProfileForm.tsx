'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Calendar, Camera, Shield, 
  CheckCircle2, AlertCircle, Loader2, Edit3, Save, X,
  FileText, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export function ProfileForm() {
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me/');
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setProfile(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          bio: userData.bio || '',
        });
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#facc15]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Alert Messages */}
      {alert && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          alert.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-br from-[#facc15] to-amber-400" />
            
            {/* Profile Info */}
            <div className="px-6 pb-6 -mt-12">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {profile?.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-slate-400">
                        {getInitials()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 p-2 bg-[#facc15] text-slate-900 rounded-full shadow-lg hover:bg-[#eab308] transition-colors disabled:opacity-50"
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
                <p className="text-slate-500 capitalize">{profile?.role}</p>
                
                {profile?.isVerified && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Verified Account
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Member Since</span>
                  </div>
                  <p className="font-medium text-[#1e293b]">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Status</span>
                  </div>
                  <p className={`font-medium ${profile?.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <h3 className="font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#facc15]" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Email Address</p>
                <p className="font-medium text-[#1e293b] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {profile?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                <p className="font-medium text-[#1e293b] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {profile?.phone || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1e293b] flex items-center gap-2">
                <User className="w-5 h-5 text-[#facc15]" />
                Personal Information
              </h3>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="gap-2"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="gap-2 bg-[#facc15] text-slate-900 hover:bg-[#eab308]"
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
                <div className="grid md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                    <p className="text-xs text-slate-400">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                      placeholder="+966 50 123 4567"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-slate-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-slate-50' : ''}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-700">
                    About Me
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-slate-50 min-h-[120px]' : 'min-h-[120px]'}
                    placeholder="Tell us a bit about yourself..."
                    rows={5}
                  />
                  <p className="text-xs text-slate-400">
                    Brief description for your profile. This will be visible to healthcare providers.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <h3 className="font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#facc15]" />
              Account Security
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1e293b]">Password</p>
                <p className="text-sm text-slate-500">Last updated 3 months ago</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
