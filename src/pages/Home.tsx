import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)] flex items-center justify-center p-4">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(210,50%,60%) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Card */}
        <div className="bg-[hsl(0,0%,100%)]/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[hsl(210,40%,88%)] p-6 sm:p-8">
          {/* Decorative top accent */}
          <div className="flex justify-center mb-2">
            <Sparkles className="w-5 h-5 text-[hsl(40,80%,55%)]" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, hsl(200,70%,40%), hsl(220,60%,50%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
              SI-BEBAS CAMKOD
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[hsl(200,70%,60%)] to-[hsl(220,60%,65%)] mx-auto mt-3 rounded-full" />
            <p className="text-xs text-[hsl(210,20%,55%)] mt-2">Media Pembelajaran Bahasa Indonesia Baku</p>
          </div>

          {/* Menu Icons */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* Perekam Suara */}
            <button
              onClick={() => navigate('/perekam-suara')}
              className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[hsl(200,50%,97%)] to-[hsl(200,40%,93%)] hover:from-[hsl(200,55%,94%)] hover:to-[hsl(200,45%,89%)] border border-[hsl(200,40%,85%)] hover:border-[hsl(200,60%,70%)] transition-all duration-200 active:scale-95 group shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[hsl(200,70%,85%)] to-[hsl(210,60%,78%)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(200,80%,40%)]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[hsl(200,40%,30%)] tracking-wide">
                PEREKAM SUARA
              </span>
            </button>

            {/* Materi */}
            <button
              onClick={() => navigate('/materi')}
              className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[hsl(35,50%,97%)] to-[hsl(35,40%,93%)] hover:from-[hsl(35,55%,94%)] hover:to-[hsl(35,45%,89%)] border border-[hsl(35,40%,85%)] hover:border-[hsl(35,60%,70%)] transition-all duration-200 active:scale-95 group shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[hsl(35,70%,85%)] to-[hsl(30,60%,78%)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(30,70%,35%)]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[hsl(30,40%,30%)] tracking-wide">
                MATERI
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
