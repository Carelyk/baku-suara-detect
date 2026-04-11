import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SpeechDetector } from '@/components/SpeechDetector';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Si Bebas Camkod - Perekam Suara';
  }, []);

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute left-4 z-50"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          left: 'max(1rem, env(safe-area-inset-left))',
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl border border-[hsl(210,40%,88%)] bg-[hsl(0,0%,100%)]/80 backdrop-blur-sm hover:bg-[hsl(210,40%,93%)]"
        >
          <Home className="h-5 w-5 text-[hsl(210,50%,40%)]" />
        </Button>
      </div>

      <SpeechDetector />
    </div>
  );
};

export default Index;
