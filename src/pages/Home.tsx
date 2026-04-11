import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)] px-4 py-6"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(210,50%,60%) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="rounded-3xl border border-[hsl(210,40%,88%)] bg-[hsl(0,0%,100%)]/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="mb-2 flex justify-center">
            <Sparkles className="h-5 w-5 text-[hsl(40,80%,55%)]" />
          </div>

          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-extrabold leading-tight tracking-wide sm:text-4xl"
              style={{
                background: 'linear-gradient(135deg, hsl(200,70%,40%), hsl(220,60%,50%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SI-BEBAS CAMKOD
            </h1>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-[hsl(200,70%,60%)] to-[hsl(220,60%,65%)]" />
            <p className="mt-2 text-xs text-[hsl(210,20%,55%)]">Media Pembelajaran Bahasa Indonesia Baku</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <button
              onClick={() => navigate('/perekam-suara')}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-[hsl(200,40%,85%)] bg-gradient-to-b from-[hsl(200,50%,97%)] to-[hsl(200,40%,93%)] p-4 shadow-sm transition-all duration-200 hover:border-[hsl(200,60%,70%)] hover:from-[hsl(200,55%,94%)] hover:to-[hsl(200,45%,89%)] hover:shadow-md active:scale-95 sm:p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(200,70%,85%)] to-[hsl(210,60%,78%)] shadow-inner transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
                <Mic className="h-8 w-8 text-[hsl(200,80%,40%)] sm:h-10 sm:w-10" />
              </div>
              <span className="text-center text-[11px] font-bold tracking-wide text-[hsl(200,40%,30%)] sm:text-sm">
                PEREKAM SUARA
              </span>
            </button>

            <button
              onClick={() => navigate('/materi')}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-[hsl(35,40%,85%)] bg-gradient-to-b from-[hsl(35,50%,97%)] to-[hsl(35,40%,93%)] p-4 shadow-sm transition-all duration-200 hover:border-[hsl(35,60%,70%)] hover:from-[hsl(35,55%,94%)] hover:to-[hsl(35,45%,89%)] hover:shadow-md active:scale-95 sm:p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(35,70%,85%)] to-[hsl(30,60%,78%)] shadow-inner transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
                <BookOpen className="h-8 w-8 text-[hsl(30,70%,35%)] sm:h-10 sm:w-10" />
              </div>
              <span className="text-center text-[11px] font-bold tracking-wide text-[hsl(30,40%,30%)] sm:text-sm">
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
