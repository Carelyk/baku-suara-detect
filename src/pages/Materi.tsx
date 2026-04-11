import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slideIcons = ['📖', '✍️', '🎯', '📚', '🔤', '📝', '📐', '🌟', '🏆'];

const slides = [
  {
    title: 'Pengertian Bahasa Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
  {
    title: 'Ciri-Ciri Bahasa Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Praesent euismod, nisi vel consectetur interdum, nisl nunc egestas nisi, vitae aliquam nisl nunc sit amet nisl.',
  },
  {
    title: 'Fungsi Bahasa Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi luctus, velit a feugiat vehicula, lorem elit lacinia mi, a facilisis nulla augue at mi. Nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus.',
  },
  {
    title: 'Ragam Bahasa Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod.',
  },
  {
    title: 'Contoh Kata Baku dan Tidak Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ut facilisis in, egestas eget quam.',
  },
  {
    title: 'Ejaan Yang Disempurnakan (EYD)',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Cras mattis consectetur purus sit amet fermentum. Donec id elit non mi porta gravida at eget metus.',
  },
  {
    title: 'Tata Bahasa Baku',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.',
  },
  {
    title: 'Penerapan Bahasa Baku dalam Kehidupan',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper.',
  },
  {
    title: 'Rangkuman',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.',
  },
];

const Materi = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const goNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(210,50%,60%) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex items-center gap-3 border-b border-[hsl(210,40%,90%)] bg-[hsl(0,0%,100%)]/70 p-3 backdrop-blur-sm sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-xl hover:bg-[hsl(210,40%,90%)]"
        >
          <Home className="h-5 w-5 text-[hsl(210,50%,40%)]" />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-[hsl(35,70%,45%)]" />
          <h1 className="truncate text-sm font-bold text-[hsl(210,40%,30%)] sm:text-lg">Materi Pembelajaran</h1>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium text-[hsl(210,30%,50%)] sm:text-xs">
              Progres Belajar
            </span>
            <span className="text-[10px] font-bold text-[hsl(200,70%,45%)] sm:text-xs">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(210,30%,88%)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(200,70%,55%)] to-[hsl(220,65%,55%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-lg">
          <div
            key={currentSlide}
            className="animate-in slide-in-from-right-2 fade-in duration-300 overflow-hidden rounded-2xl border border-[hsl(210,40%,88%)] bg-[hsl(0,0%,100%)]/90 shadow-lg backdrop-blur-sm"
          >
            <div className="border-b border-[hsl(210,40%,88%)] bg-gradient-to-r from-[hsl(200,55%,92%)] to-[hsl(210,50%,94%)] px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-3xl sm:text-4xl">{slideIcons[currentSlide]}</span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[hsl(210,30%,55%)]">
                    Materi {currentSlide + 1}
                  </p>
                  <h2 className="text-base font-bold leading-snug text-[hsl(210,50%,30%)] sm:text-lg">
                    {slides[currentSlide].title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="min-h-[220px] p-5 sm:min-h-[260px] sm:p-6">
              <p className="text-sm leading-relaxed text-[hsl(210,15%,35%)] sm:text-base">
                {slides[currentSlide].content}
              </p>
            </div>

            {currentSlide === slides.length - 1 && (
              <div className="flex justify-center px-5 pb-4">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-[hsl(40,60%,80%)] bg-gradient-to-r from-[hsl(40,80%,92%)] to-[hsl(35,70%,90%)] px-4 py-2 text-center">
                  <Star className="h-4 w-4 shrink-0 fill-[hsl(40,80%,50%)] text-[hsl(40,80%,50%)]" />
                  <span className="text-xs font-bold leading-relaxed text-[hsl(35,50%,35%)]">
                    Selamat! Kamu sudah selesai membaca semua materi 🎉
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="order-1 min-w-[120px] flex-1 rounded-xl border-[hsl(210,40%,85%)] bg-[hsl(0,0%,100%)]/80 shadow-sm hover:bg-[hsl(210,40%,93%)] disabled:opacity-30 sm:min-w-0 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Button>

            <Button
              variant="outline"
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="order-2 min-w-[120px] flex-1 rounded-xl border-[hsl(210,40%,85%)] bg-[hsl(0,0%,100%)]/80 shadow-sm hover:bg-[hsl(210,40%,93%)] disabled:opacity-30 sm:order-3 sm:min-w-0 sm:flex-none"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="order-3 flex w-full justify-center overflow-x-auto py-1 sm:order-2 sm:w-auto">
              <div className="flex gap-1 px-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Buka slide ${i + 1}`}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 sm:h-2.5 sm:w-2.5 ${
                      i === currentSlide
                        ? 'scale-125 bg-[hsl(200,70%,50%)]'
                        : i < currentSlide
                          ? 'bg-[hsl(200,50%,70%)]'
                          : 'bg-[hsl(210,20%,82%)] hover:bg-[hsl(210,30%,70%)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materi;
