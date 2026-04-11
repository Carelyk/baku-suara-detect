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
      {/* Back to Home button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full bg-[hsl(0,0%,100%)] border-[hsl(120,30%,80%)] hover:bg-[hsl(120,30%,85%)]"
        >
          <Home className="w-5 h-5 text-[hsl(200,40%,30%)]" />
        </Button>
      </div>
      <SpeechDetector />
    </div>
  );
};

export default Index;
