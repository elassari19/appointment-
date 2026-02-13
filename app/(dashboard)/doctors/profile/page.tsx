import { DoctorPublicProfile } from '@/components/doctors/DoctorPublicProfile';

interface PageProps {
  params: Promise<{ id?: string }>;
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <DoctorPublicProfile doctorId={resolvedParams?.id} />
  );
}
