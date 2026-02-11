'use client';

import Image from 'next/image';

interface AppointmentCardProps {
  specialty: string;
  date: string;
  doctorName: string;
  doctorInitials?: string;
  doctorAvatarUrl?: string;
  description: string;
  type: string;
  duration: string;
  onJoin?: () => void;
  onReschedule?: () => void;
}

export function AppointmentCard({
  specialty,
  date,
  doctorName,
  doctorInitials = 'DR',
  doctorAvatarUrl,
  description,
  type,
  duration,
  onJoin,
  onReschedule,
}: AppointmentCardProps) {
  return (
    <div className="bg-[#2D3339] text-white rounded-3xl overflow-hidden shadow-xl">
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-4xl font-bold border-4 border-white/10 flex-shrink-0 overflow-hidden">
            {doctorAvatarUrl ? (
              <Image src={doctorAvatarUrl} alt={doctorName} fill className="object-cover" />
            ) : (
              doctorInitials
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase">
                {specialty}
              </span>
              <span className="text-white/40 text-sm">• {date}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{doctorName}</h3>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                <span className="material-icons-round text-primary text-lg">videocam</span>
                <span className="text-sm font-medium">{type}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                <span className="material-icons-round text-primary text-lg">timer</span>
                <span className="text-sm font-medium">{duration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 justify-center min-w-[140px]">
          <button
            onClick={onJoin}
            className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#2D3339] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round">video_call</span>
            Join Meeting
          </button>
          <button
            onClick={onReschedule}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
