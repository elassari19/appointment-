'use client';

import { useState, useEffect } from 'react';

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Award {
  title: string;
  organization: string;
  year: string;
}

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  specialty: string;
  languages: { name: string; level: string }[];
  isVerified: boolean;
  experience: number;
  rating: number;
  reviewCount: number;
  patientCount: number;
  consultationFee: number;
  awards: Award[];
  clinic: {
    name: string;
    address: string;
    hours: Record<string, string>;
  };
  education: Education[];
  specializations: string[];
}

interface DoctorPublicProfileProps {
  doctorId?: string;
}

export function DoctorPublicProfile({ doctorId }: DoctorPublicProfileProps) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<DoctorProfile>>({});
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, [doctorId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const url = doctorId ? `/api/doctors/${doctorId}` : '/api/doctors/me';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      
      // Transform API response to match component interface
      const transformedProfile: DoctorProfile = {
        id: data.id || data.user?.id || '',
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        email: data.user?.email || '',
        role: data.user?.role || '',
        phone: data.user?.phone,
        profilePicture: data.user?.profilePicture,
        bio: data.user?.bio || data.professionalSummary,
        specialty: data.specialty || 'General Practice',
        languages: data.languages || [{ name: 'English', level: 'Native' }],
        isVerified: data.user?.isVerified || false,
        experience: data.yearsOfExperience || 1,
        rating: data.ratingSummary?.averageRating || 4.8,
        reviewCount: data.ratingSummary?.totalReviews || 0,
        patientCount: data.totalPatients || 0,
        consultationFee: data.consultationFee || 150,
        awards: (data.awards || []).map((award: any) => ({
          title: award.title,
          organization: award.organization,
          year: String(award.year)
        })),
        clinic: {
          name: data.clinicName || 'Metropolitan Medical Center',
          address: data.clinicAddress || '725 5th Ave, Manhattan, New York, NY 10022',
          hours: data.clinicHours || {}
        },
        education: (data.education || []).map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          year: String(edu.year)
        })),
        specializations: data.subSpecialties || []
      };
      
      setProfile(transformedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      
      // Transform editData to match API expectations
      const apiData: Record<string, any> = {};
      
      if (editData.bio !== undefined) {
        apiData.professionalSummary = editData.bio;
      }
      if (editData.specialty !== undefined) {
        apiData.specialty = editData.specialty;
      }
      if (editData.consultationFee !== undefined) {
        apiData.consultationFee = editData.consultationFee;
      }
      if (editData.languages !== undefined) {
        apiData.languages = editData.languages;
      }
      if (editData.specializations !== undefined) {
        apiData.subSpecialties = editData.specializations;
      }
      if (editData.education !== undefined) {
        apiData.education = editData.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.degree,
          year: parseInt(edu.year)
        }));
      }
      
      const response = await fetch('/api/doctors/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Refetch to get updated data in correct format
      await fetchProfile();
      setIsEditing(false);
      setEditData({});
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    if (profile) {
      setEditData({
        bio: profile.bio,
        specialty: profile.specialty,
        consultationFee: profile.consultationFee,
        languages: profile.languages,
        specializations: profile.specializations,
        education: profile.education,
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setEditData({});
    setIsEditing(false);
  };

  const addSpecialization = () => {
    const current = editData.specializations || profile?.specializations || [];
    setEditData({ ...editData, specializations: [...current, ''] });
  };

  const updateSpecialization = (index: number, value: string) => {
    const current = editData.specializations || profile?.specializations || [];
    const updated = [...current];
    updated[index] = value;
    setEditData({ ...editData, specializations: updated });
  };

  const removeSpecialization = (index: number) => {
    const current = editData.specializations || profile?.specializations || [];
    const updated = current.filter((_, i) => i !== index);
    setEditData({ ...editData, specializations: updated });
  };

  const addEducation = () => {
    const current = editData.education || profile?.education || [];
    setEditData({ ...editData, education: [...current, { institution: '', degree: '', year: '' }] });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const current = editData.education || profile?.education || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, education: updated });
  };

  const removeEducation = (index: number) => {
    const current = editData.education || profile?.education || [];
    const updated = current.filter((_, i) => i !== index);
    setEditData({ ...editData, education: updated });
  };

  const addLanguage = () => {
    const current = editData.languages || profile?.languages || [];
    setEditData({ ...editData, languages: [...current, { name: '', level: 'Fluent' }] });
  };

  const updateLanguage = (index: number, field: 'name' | 'level', value: string) => {
    const current = editData.languages || profile?.languages || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, languages: updated });
  };

  const removeLanguage = (index: number) => {
    const current = editData.languages || profile?.languages || [];
    const updated = current.filter((_, i) => i !== index);
    setEditData({ ...editData, languages: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error || 'Profile not found'}</div>
        <button onClick={fetchProfile} className="px-4 py-2 bg-primary text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const fullName = `Dr. ${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
  const currentBio = editData.bio ?? profile.bio ?? `${fullName} is a board-certified ${profile.specialty.toLowerCase()} specialist with ${profile.experience} years of experience.`;
  const currentSpecialty = editData.specialty ?? profile.specialty;
  const currentFee = editData.consultationFee ?? profile.consultationFee;
  const currentSpecs = editData.specializations ?? profile.specializations;
  const currentEdu = editData.education ?? profile.education;
  const currentLangs = editData.languages ?? profile.languages;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative group">
            {profile.profilePicture ? (
              <img
                alt={fullName}
                className="w-40 h-40 md:w-48 md:h-48 rounded-xl object-cover shadow-lg border-4 border-white dark:border-slate-800"
                src={profile.profilePicture}
              />
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl object-cover shadow-lg border-4 border-white dark:border-slate-800 bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-primary">{initials}</span>
                </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg">
              <span className="material-icons-round text-xs">verified</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold text-charcoal dark:text-white">{fullName}, MD</h1>
                  <span className="material-icons-round text-primary" title="Verified Professional">verified</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentSpecialty}
                    onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                    className="text-lg text-primary font-bold bg-transparent border-b-2 border-primary focus:outline-none w-full"
                  />
                ) : (
                  <p className="text-lg text-primary font-bold">{currentSpecialty}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Available for Consultation
                  </span>
                </div>
              </div>
              {!doctorId && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-icons-round text-sm">{saving ? 'hourglass_empty' : 'save'}</span>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="border border-charcoal/20 dark:border-slate-700 text-charcoal dark:text-slate-300 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditing}
                      className="border border-charcoal/20 dark:border-slate-700 text-charcoal dark:text-slate-300 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      <span className="material-icons-round text-sm">edit</span>
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Experience</span>
                <span className="text-xl font-bold text-charcoal dark:text-white">{profile.experience}+ Years</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Patients</span>
                <span className="text-xl font-bold text-charcoal dark:text-white">{profile.patientCount.toLocaleString()}+</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Rating</span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-charcoal dark:text-white">{profile.rating}</span>
                <span className="material-icons-round text-primary text-sm">star</span>
                <span className="text-slate-400 dark:text-slate-500 text-xs">({profile.reviewCount})</span>
              </div>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Location</span>
                <span className="text-xl font-bold text-charcoal dark:text-white">New York, NY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">person_outline</span>
              About Me
            </h2>
            {isEditing ? (
              <textarea
                value={currentBio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={6}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary resize-none"
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{currentBio}</p>
            )}
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">school</span>
              Education & Training
            </h2>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/20">
              {currentEdu.map((edu, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-[24px] h-[24px] bg-white dark:bg-slate-900 border-2 border-primary rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Degree/Certification"
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="Institution"
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        placeholder="Year"
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-24"
                      />
                      <button onClick={() => removeEducation(index)} className="text-red-500 text-sm hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-charcoal dark:text-white">{edu.degree}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{edu.institution} | {edu.year}</p>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={addEducation} className="ml-8 text-primary font-bold text-sm hover:underline flex items-center gap-1">
                  <span className="material-icons-round text-sm">add</span>
                  Add Education
                </button>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">psychology</span>
              Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              {currentSpecs.map((spec, index) => (
                <span key={index} className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-charcoal dark:text-primary text-sm font-semibold rounded-lg border border-primary/20">
                  {spec}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="mt-4 space-y-2">
                {currentSpecs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => updateSpecialization(index, e.target.value)}
                      placeholder="Specialization"
                      className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    />
                    <button onClick={() => removeSpecialization(index)} className="text-red-500 hover:underline">
                      <span className="material-icons-round">close</span>
                    </button>
                  </div>
                ))}
                <button onClick={addSpecialization} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                  <span className="material-icons-round text-sm">add</span>
                  Add Specialization
                </button>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">military_tech</span>
              Awards & Recognitions
            </h2>
            <ul className="space-y-4">
              {profile.awards?.map((award, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="material-icons-round text-primary mt-0.5">emoji_events</span>
                  <div>
                    <p className="font-bold text-charcoal dark:text-white">{award.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{award.organization} | {award.year}</p>
                  </div>
                </li>
              )) || (
                <li className="flex items-start gap-3">
                  <span className="material-icons-round text-primary mt-0.5">emoji_events</span>
                  <div>
                    <p className="font-bold text-charcoal dark:text-white">Top Doctor Award 2024</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Medical Excellence Association</p>
                  </div>
                </li>
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">attach_money</span>
              Consultation Fee
            </h2>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-charcoal dark:text-white">$</span>
                <input
                  type="number"
                  value={currentFee}
                  onChange={(e) => setEditData({ ...editData, consultationFee: parseInt(e.target.value) || 0 })}
                  className="text-2xl font-bold text-charcoal dark:text-white bg-transparent border-b-2 border-primary focus:outline-none w-24"
                />
              </div>
            ) : (
              <p className="text-3xl font-bold text-primary">${currentFee}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Per consultation session</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">location_on</span>
              Clinic Location
            </h2>
            <div className="rounded-lg overflow-hidden h-32 bg-slate-200 dark:bg-slate-800 relative mb-4">
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-3xl">place</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-charcoal dark:text-white">{profile.clinic.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">{profile.clinic.address}</p>
              <a className="text-primary text-sm font-bold flex items-center gap-1 hover:underline" href="#">
                Get Directions
                <span className="material-icons-round text-xs">open_in_new</span>
              </a>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">translate</span>
              Languages Spoken
            </h2>
            <div className="space-y-3">
              {currentLangs.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                        placeholder="Language"
                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      />
                      <select
                        value={lang.level}
                        onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Basic">Basic</option>
                      </select>
                      <button onClick={() => removeLanguage(index)} className="text-red-500">
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-700 dark:text-slate-300">{lang.name}</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase font-bold text-slate-500">{lang.level}</span>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={addLanguage} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                  <span className="material-icons-round text-sm">add</span>
                  Add Language
                </button>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-primary/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal dark:text-white">
              <span className="material-icons-round text-primary">verified_user</span>
              Accepted Insurance
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {['BlueCross', 'Aetna', 'UnitedHealth', 'Cigna'].map((ins, i) => (
                <div key={i} className="border border-slate-100 dark:border-slate-800 p-2 rounded flex items-center justify-center h-10">
                  <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase italic">{ins}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-xs text-slate-400 underline cursor-pointer hover:text-primary transition-colors">View all 20+ providers</p>
          </section>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20">
            <h3 className="font-bold text-charcoal dark:text-white mb-2">Need Help?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Our support team is available 24/7 to help you with booking or insurance questions.</p>
            <button className="w-full py-2.5 bg-white dark:bg-slate-900 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
