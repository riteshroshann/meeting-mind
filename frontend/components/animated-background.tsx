"use client"

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70 animate-gradient-shift"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-1"></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-2"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-3"></div>
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob-1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes blob-2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 60px) scale(0.95); }
          66% { transform: translate(50px, -30px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes blob-3 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(1.02); }
          66% { transform: translate(-60px, -20px) scale(0.98); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-gradient-shift {
          animation: gradient-shift 15s ease infinite;
          background-size: 200% 200%;
        }
        .animate-blob-1 {
          animation: blob-1 12s infinite alternate;
        }
        .animate-blob-2 {
          animation: blob-2 14s infinite alternate-reverse;
        }
        .animate-blob-3 {
          animation: blob-3 10s infinite alternate;
        }
      `}</style>
    </div>
  )
}
