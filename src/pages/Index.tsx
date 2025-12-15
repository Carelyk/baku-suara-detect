import { useEffect } from 'react';
import { SpeechDetector } from '@/components/SpeechDetector';

const Index = () => {
  useEffect(() => {
    document.title = 'Deteksi Bahasa Indonesia Baku - Latihan Berbicara';
  }, []);

  return <SpeechDetector />;
};

export default Index;
