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
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection('next');
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setDirection('prev');
      setCurrentSlide(currentSlide - 1);
    }
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(205,60%,94%)] via-[hsl(210,50%,96%)] to-[hsl(220,50%,92%)] flex flex-col">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(210,50%,60%) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Header */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center gap-3 bg-[hsl(0,0%,100%)]/70 backdrop-blur-sm border-b border-[hsl(210,40%,90%)]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl hover:bg-[hsl(210,40%,90%)]"
        >
          <Home className="w-5 h-5 text-[hsl(210,50%,40%)]" />
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[hsl(35,70%,45%)]" />
          <h1 className="text-base sm:text-lg font-bold text-[hsl(210,40%,30%)]">Materi Pembelajaran</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-4 pt-3">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-[hsl(210,30%,50%)]">
              Progres Belajar
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[hsl(200,70%,45%)]">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
          <div className="h-2 bg-[hsl(210,30%,88%)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[hsl(200,70%,55%)] to-[hsl(220,65%,55%)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-lg">
          <div 
            key={currentSlide}
            className="bg-[hsl(0,0%,100%)]/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[hsl(210,40%,88%)] overflow-hidden animate-in fade-in slide-in-from-right-2 duration-300"
          >
            {/* Slide Header with emoji */}
            <div className="bg-gradient-to-r from-[hsl(200,55%,92%)] to-[hsl(210,50%,94%)] px-5 sm:px-6 py-4 border-b border-[hsl(210,40%,88%)]">
              <div className="flex items-start gap-3">
                <span className="text-3xl sm:text-4xl mt-0.5">{slideIcons[currentSlide]}</span>
                <div className="flex-1">
                  <p className="text-[10px] text-[hsl(210,30%,55%)] font-medium uppercase tracking-wider mb-0.5">
                    Materi {currentSlide + 1}
                  </p>
                  <h2 className="text-base sm:text-lg font-bold text-[hsl(210,50%,30%)] leading-snug">
                    {slides[currentSlide].title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Slide Body */}
            <div className="p-5 sm:p-6 min-h-[200px] sm:min-h-[260px]">
              <p className="text-sm sm:text-base text-[hsl(210,15%,35%)] leading-relaxed">
                {slides[currentSlide].content}
              </p>
            </div>

            {/* Achievement badge for last slide */}
            {currentSlide === slides.length - 1 && (
              <div className="px-5 pb-4 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[hsl(40,80%,92%)] to-[hsl(35,70%,90%)] rounded-full border border-[hsl(40,60%,80%)]">
                  <Star className="w-4 h-4 text-[hsl(40,80%,50%)] fill-[hsl(40,80%,50%)]" />
                  <span className="text-xs font-bold text-[hsl(35,50%,35%)]">Selamat! Kamu sudah selesai membaca semua materi 🎉</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="gap-1.5 rounded-xl bg-[hsl(0,0%,100%)]/80 border-[hsl(210,40%,85%)] hover:bg-[hsl(210,40%,93%)] disabled:opacity-30 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Button>

            {/* Dot indicators - scrollable on mobile */}
            <div className="flex gap-1 overflow-x-auto py-1 px-1 max-w-[180px] sm:max-w-none justify-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentSlide ? 'next' : 'prev');
                    setCurrentSlide(i);
                  }}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                    i === currentSlide
                      ? 'bg-[hsl(200,70%,50%)] scale-125'
                      : i < currentSlide
                        ? 'bg-[hsl(200,50%,70%)]'
                        : 'bg-[hsl(210,20%,82%)] hover:bg-[hsl(210,30%,70%)]'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="gap-1.5 rounded-xl bg-[hsl(0,0%,100%)]/80 border-[hsl(210,40%,85%)] hover:bg-[hsl(210,40%,93%)] disabled:opacity-30 shadow-sm"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materi;
