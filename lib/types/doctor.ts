export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  year: number;
  description?: string;
}

export interface LanguageEntry {
  name: string;
  level: 'Basic' | 'Conversational' | 'Professional' | 'Native';
  isPrimary: boolean;
}

export interface AwardEntry {
  title: string;
  organization: string;
  year: number;
  description?: string;
}

export interface PublicationEntry {
  title: string;
  journal: string;
  year: number;
  url?: string;
  description?: string;
}

export interface ClinicHoursEntry {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface LicenseInfo {
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isVerified: boolean;
  verificationDate?: string;
}

export interface DoctorProfileResponse {
  id: string;
  userId: string;
  specialty: string | null;
  subSpecialties: string[];
  licenseInfo: LicenseInfo | null;
  medicalSchool: string | null;
  residency: string | null;
  fellowship: string | null;
  yearsOfExperience: number | null;
  boardCertifications: string[];
  clinicName: string | null;
  clinicAddress: string | null;
  clinicPhone: string | null;
  clinicHours: ClinicHoursEntry[];
  consultationFee: number | null;
  followUpFee: number | null;
  telemedicineEnabled: boolean;
  insuranceAccepted: string[];
  acceptingNewPatients: boolean;
  professionalSummary: string | null;
  education: EducationEntry[];
  languages: LanguageEntry[];
  awards: AwardEntry[];
  publications: PublicationEntry[];
  professionalMemberships: string[];
  websiteUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  totalPatients: number | null;
  totalAppointments: number | null;
  completedAppointments: number | null;
  averageResponseTimeHours: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface DoctorProfileUpdate {
  specialty?: string;
  subSpecialties?: string[];
  licenseInfo?: LicenseInfo;
  medicalSchool?: string;
  residency?: string;
  fellowship?: string;
  yearsOfExperience?: number;
  boardCertifications?: string[];
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicHours?: ClinicHoursEntry[];
  consultationFee?: number;
  followUpFee?: number;
  telemedicineEnabled?: boolean;
  insuranceAccepted?: string[];
  acceptingNewPatients?: boolean;
  professionalSummary?: string;
  education?: EducationEntry[];
  languages?: LanguageEntry[];
  awards?: AwardEntry[];
  publications?: PublicationEntry[];
  professionalMemberships?: string[];
  websiteUrl?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export interface DoctorProfileWithUser {
  id: string;
  userId: string;
  specialty: string | null;
  subSpecialties: string[];
  licenseInfo: LicenseInfo | null;
  medicalSchool: string | null;
  residency: string | null;
  fellowship: string | null;
  yearsOfExperience: number | null;
  boardCertifications: string[];
  clinicName: string | null;
  clinicAddress: string | null;
  clinicPhone: string | null;
  clinicHours: ClinicHoursEntry[];
  consultationFee: number | null;
  followUpFee: number | null;
  telemedicineEnabled: boolean;
  insuranceAccepted: string[];
  acceptingNewPatients: boolean;
  professionalSummary: string | null;
  education: EducationEntry[];
  languages: LanguageEntry[];
  awards: AwardEntry[];
  publications: PublicationEntry[];
  professionalMemberships: string[];
  websiteUrl: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  totalPatients: number | null;
  totalAppointments: number | null;
  completedAppointments: number | null;
  averageResponseTimeHours: number;
  isFeatured: boolean;
  isPublished: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
    bio: string | null;
    phone: string | null;
    isVerified: boolean;
  };
}

export interface ReviewResponse {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string | null;
  rating: number;
  comment: string | null;
  bedsideManner: number | null;
  waitTime: number | null;
  communication: number | null;
  thoroughness: number | null;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  response: string | null;
  responseDate: string | null;
  tags: string[];
  helpfulCount: number;
  isAnonymous: boolean;
  title: string | null;
  createdAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

export interface DoctorRatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageBedsideManner: number;
  averageWaitTime: number;
  averageCommunication: number;
  averageThoroughness: number;
}

export interface DoctorSearchFilters {
  specialty?: string;
  subSpecialty?: string;
  language?: string;
  consultationFeeMin?: number;
  consultationFeeMax?: number;
  acceptingNewPatients?: boolean;
  telemedicineAvailable?: boolean;
  insurance?: string;
  gender?: string;
  yearsOfExperienceMin?: number;
  yearsOfExperienceMax?: number;
  ratingMin?: number;
  searchQuery?: string;
}
