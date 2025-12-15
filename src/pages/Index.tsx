import { SpeechDetector } from '@/components/SpeechDetector';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Deteksi Bahasa Indonesia Baku - Latihan Berbicara</title>
        <meta name="description" content="Aplikasi deteksi suara untuk memeriksa penggunaan Bahasa Indonesia baku sesuai KBBI. Latih kemampuan berbicara Bahasa Indonesia yang baik dan benar." />
      </Helmet>
      <SpeechDetector />
    </>
  );
};

export default Index;
