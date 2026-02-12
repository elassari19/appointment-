import { ProfileForm } from '@/components/profile/ProfileForm';

export default function DietitianProfilePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your professional profile and information
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
