import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';

export const SpeechDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptText;
          } else {
            interim += transcriptText;
          }
        }
        
        setInterimTranscript(interim);
        
        if (final) {
          setTranscript(prev => prev + final);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioStream();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioStream();
    };
  }, [isListening]);

  const stopAudioStream = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  const validateIndonesian = (text: string) => {
    const informalWords: Record<string, string> = {
      'gue': 'saya',
      'gua': 'saya',
      'gw': 'saya',
      'lo': 'kamu',
      'lu': 'kamu',
      'elu': 'kamu',
      'kagak': 'tidak',
      'gak': 'tidak',
      'nggak': 'tidak',
      'enggak': 'tidak',
      'udah': 'sudah',
      'udeh': 'sudah',
      'gimana': 'bagaimana',
      'gitu': 'begitu',
      'gini': 'begini',
      'emang': 'memang',
      'emg': 'memang',
      'banget': 'sangat',
      'bgt': 'sangat',
      'aja': 'saja',
      'doang': 'saja',
      'cuma': 'hanya',
      'cuman': 'hanya',
      'kayak': 'seperti',
      'kaya': 'seperti',
      'kek': 'seperti',
      'bikin': 'membuat',
      'bkin': 'membuat',
      'ngomong': 'berbicara',
      'bilang': 'mengatakan',
      'nih': 'ini',
      'tuh': 'itu',
      'dong': '',
      'deh': '',
      'sih': '',
      'lah': '',
      'kok': 'mengapa',
      'kenapa': 'mengapa',
      'pengen': 'ingin',
      'mau': 'ingin',
      'bisa': 'dapat',
      'sama': 'dengan',
      'ama': 'dengan',
      'pake': 'menggunakan',
      'pakai': 'menggunakan',
      'nyari': 'mencari',
      'lagi': 'sedang',
      'abis': 'setelah',
      'habis': 'setelah',
      'terus': 'kemudian',
      'trus': 'kemudian',
    };

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    const foundInformal: string[] = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?]/g, '');
      if (informalWords[cleanWord]) {
        foundInformal.push(`"${cleanWord}" → "${informalWords[cleanWord]}"`);
      }
    }

    if (foundInformal.length > 0) {
      setIsCorrect(false);
      setErrorMessage(`Ditemukan kata tidak baku:\n${foundInformal.join('\n')}`);
    } else {
      setIsCorrect(true);
      setErrorMessage('');
    }
    setShowResult(true);
  };

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      stopAudioStream();
      
      // Validate when stopping
      const fullTranscript = transcript + interimTranscript;
      if (fullTranscript.trim()) {
        validateIndonesian(fullTranscript);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setTranscript('');
        setInterimTranscript('');
        setShowResult(false);
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const closeResult = () => {
    setShowResult(false);
  };

  const fullTranscript = transcript + interimTranscript;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-secondary/30 to-background">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Deteksi Bahasa Baku
          </h1>
          <p className="text-muted-foreground">
            Berbicara dalam Bahasa Indonesia yang baku
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6 md:p-8 bg-card shadow-xl border-secondary/50">
          <div className="flex flex-col items-center space-y-6">
            {/* Microphone Button */}
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-accent/30 pulse-ring" />
                  <div className="absolute inset-0 rounded-full bg-accent/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              <Button
                onClick={toggleListening}
                size="lg"
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/30' 
                    : 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/30'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 md:w-12 md:h-12 text-accent-foreground" />
                ) : (
                  <Mic className="w-10 h-10 md:w-12 md:h-12 text-secondary-foreground" />
                )}
              </Button>
            </div>

            <p className={`text-sm font-medium ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
              {isListening ? 'Tekan untuk berhenti' : 'Tekan untuk mulai'}
            </p>

            {/* Waveform */}
            <SpeechWaveform audioStream={audioStream} />

            {/* Live Transcript Preview */}
            <LiveTranscript 
              transcript={fullTranscript}
              isListening={isListening}
            />
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-4 bg-secondary/10 border-secondary/20">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Gunakan bahasa baku KBBI
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Hindari bahasa slang
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Berbicara dengan jelas
            </li>
          </ul>
        </Card>
      </div>

      {/* Result Popup */}
      <ResultPopup 
        isOpen={showResult}
        isCorrect={isCorrect}
        message={isCorrect ? 'Bahasa Indonesia Baku!' : errorMessage}
        transcript={transcript || interimTranscript}
        onClose={closeResult}
      />
    </div>
  );
};