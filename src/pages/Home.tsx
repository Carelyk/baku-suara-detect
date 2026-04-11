import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(120,30%,90%)] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(hsl(120,30%,80%) 1px, transparent 1px), linear-gradient(90deg, hsl(120,30%,80%) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-[hsl(0,0%,100%)] rounded-3xl shadow-xl border-2 border-[hsl(120,30%,80%)] p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(200,40%,30%)] tracking-wide"
                style={{ textShadow: '2px 2px 0px hsl(120, 30%, 75%)' }}>
              SI-BEBAS CAMKOD
            </h1>
            <div className="w-16 h-1 bg-[hsl(120,40%,65%)] mx-auto mt-2 rounded-full" />
          </div>

          {/* Menu Icons */}
          <div className="grid grid-cols-2 gap-6">
            {/* Perekam Suara */}
            <button
              onClick={() => navigate('/perekam-suara')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[hsl(200,30%,96%)] hover:bg-[hsl(200,40%,92%)] border-2 border-[hsl(200,30%,88%)] hover:border-[hsl(200,50%,75%)] transition-all duration-200 active:scale-95 group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(200,60%,88%)] flex items-center justify-center group-hover:bg-[hsl(200,60%,80%)] transition-colors">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(200,70%,45%)]" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-[hsl(200,40%,30%)]">
                PEREKAM SUARA
              </span>
            </button>

            {/* Materi */}
            <button
              onClick={() => navigate('/materi')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[hsl(30,30%,96%)] hover:bg-[hsl(30,40%,92%)] border-2 border-[hsl(30,30%,88%)] hover:border-[hsl(30,50%,75%)] transition-all duration-200 active:scale-95 group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(30,60%,88%)] flex items-center justify-center group-hover:bg-[hsl(30,60%,80%)] transition-colors">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(30,70%,40%)]" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-[hsl(30,40%,30%)]">
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
