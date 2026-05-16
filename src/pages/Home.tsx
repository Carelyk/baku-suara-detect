import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, Sparkles, Target, ScrollText } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      label: 'PEREKAM SUARA',
      icon: Mic,
      to: '/perekam-suara',
      from: 'hsl(200,50%,97%)',
      to2: 'hsl(200,40%,93%)',
      border: 'hsl(200,40%,85%)',
      iconFrom: 'hsl(200,70%,85%)',
      iconTo: 'hsl(210,60%,78%)',
      iconColor: 'hsl(200,80%,40%)',
      textColor: 'hsl(200,40%,30%)',
    },
    {
      label: 'MATERI',
      icon: BookOpen,
      to: '/materi',
      from: 'hsl(35,50%,97%)',
      to2: 'hsl(35,40%,93%)',
      border: 'hsl(35,40%,85%)',
      iconFrom: 'hsl(35,70%,85%)',
      iconTo: 'hsl(30,60%,78%)',
      iconColor: 'hsl(30,70%,35%)',
      textColor: 'hsl(30,40%,30%)',
    },
    {
      label: 'CAPAIAN & TUJUAN',
      icon: Target,
      to: '/capaian',
      from: 'hsl(280,50%,97%)',
      to2: 'hsl(280,40%,93%)',
      border: 'hsl(280,40%,85%)',
      iconFrom: 'hsl(280,70%,85%)',
      iconTo: 'hsl(290,60%,78%)',
      iconColor: 'hsl(280,70%,35%)',
      textColor: 'hsl(280,40%,30%)',
    },
    {
      label: 'RIWAYAT HASIL',
      icon: ScrollText,
      to: '/riwayat',
      from: 'hsl(25,55%,97%)',
      to2: 'hsl(25,45%,93%)',
      border: 'hsl(25,50%,85%)',
      iconFrom: 'hsl(25,80%,85%)',
      iconTo: 'hsl(20,70%,78%)',
      iconColor: 'hsl(25,85%,40%)',
      textColor: 'hsl(25,50%,30%)',
    },
  ];

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
        <div className="rounded-3xl border border-[hsl(210,40%,88%)] bg-white/90 p-5 shadow-xl backdrop-blur-sm sm:p-7">
          <div className="mb-2 flex justify-center">
            <Sparkles className="h-5 w-5 text-[hsl(40,80%,55%)]" />
          </div>

          <div className="mb-6 text-center">
            <h1
              className="text-2xl font-extrabold leading-tight tracking-wide sm:text-3xl"
              style={{
                background: 'linear-gradient(135deg, hsl(200,70%,40%), hsl(220,60%,50%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SI-BEBAS CAMKOD
            </h1>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[hsl(200,70%,60%)] to-[hsl(220,60%,65%)]" />
            <p className="mt-2 text-[11px] text-[hsl(210,20%,55%)] sm:text-xs">
              Media Pembelajaran Bahasa Indonesia Baku
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.to}
                  onClick={() => navigate(t.to)}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border p-3 shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 sm:p-5"
                  style={{
                    background: `linear-gradient(to bottom, ${t.from}, ${t.to2})`,
                    borderColor: t.border,
                  }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
                    style={{
                      background: `linear-gradient(135deg, ${t.iconFrom}, ${t.iconTo})`,
                    }}
                  >
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: t.iconColor }} />
                  </div>
                  <span
                    className="text-center text-[10px] font-bold leading-tight tracking-wide sm:text-xs"
                    style={{ color: t.textColor }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
