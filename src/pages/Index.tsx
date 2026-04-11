import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpeechDetector } from '@/components/SpeechDetector';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Si Bebas Camkod - Perekam Suara';
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl bg-[hsl(0,0%,100%)]/80 backdrop-blur-sm hover:bg-[hsl(210,40%,93%)] border border-[hsl(210,40%,88%)]"
        >
          <Home className="w-5 h-5 text-[hsl(210,50%,40%)]" />
        </Button>
      </div>
      <SpeechDetector />
    </div>
  );
};

export default Index;
