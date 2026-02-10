'use client';

export default function BackgroundShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-red-500 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-400 rounded-full blur-xl animate-pulse delay-500" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-600 rounded-full blur-xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-orange-600 rounded-full blur-2xl animate-pulse delay-300" />
    </div>
  );
}
