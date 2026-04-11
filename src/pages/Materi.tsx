import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="min-h-screen bg-[hsl(120,30%,90%)] flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(hsl(120,30%,80%) 1px, transparent 1px), linear-gradient(90deg, hsl(120,30%,80%) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full bg-[hsl(0,0%,100%)] border-[hsl(120,30%,80%)] hover:bg-[hsl(120,30%,85%)]"
        >
          <Home className="w-5 h-5 text-[hsl(200,40%,30%)]" />
        </Button>
        <h1 className="text-xl font-bold text-[hsl(200,40%,30%)]">SI-BEBAS CAMKOD</h1>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-4">
        <div className="w-full max-w-lg bg-[hsl(0,0%,100%)] rounded-2xl shadow-lg border-2 border-[hsl(120,30%,80%)] overflow-hidden">
          {/* Slide Header */}
          <div className="bg-[hsl(200,60%,88%)] px-6 py-4 border-b border-[hsl(200,30%,80%)]">
            <p className="text-xs text-[hsl(200,40%,50%)] mb-1">
              Slide {currentSlide + 1} / {slides.length}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-[hsl(200,40%,25%)]">
              {slides[currentSlide].title}
            </h2>
          </div>

          {/* Slide Body */}
          <div className="p-6 min-h-[250px] sm:min-h-[300px]">
            <p className="text-[hsl(200,20%,35%)] leading-relaxed">
              {slides[currentSlide].content}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 bg-[hsl(0,0%,98%)] border-t border-[hsl(120,30%,90%)]">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="gap-1 rounded-xl border-[hsl(120,30%,80%)] hover:bg-[hsl(120,30%,90%)] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentSlide
                      ? 'bg-[hsl(200,70%,50%)]'
                      : 'bg-[hsl(200,20%,82%)] hover:bg-[hsl(200,30%,70%)]'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="gap-1 rounded-xl border-[hsl(120,30%,80%)] hover:bg-[hsl(120,30%,90%)] disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materi;
