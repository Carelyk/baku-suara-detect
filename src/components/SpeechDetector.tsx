import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
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
  const streamRef = useRef<MediaStream | null>(null);

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

  const stopAudioStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setAudioStream(null);
    }
  }, []);

  const validateIndonesian = useCallback((text: string) => {
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
  }, [informalWords]);

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
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioStream();
    };
  }, [stopAudioStream]);

  const startListening = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        setAudioStream(stream);
        setTranscript('');
        setInterimTranscript('');
        setShowResult(false);
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        setIsListening(true);
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        alert('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon sudah diberikan.');
      });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    stopAudioStream();
    
    const fullTranscript = transcript + interimTranscript;
    if (fullTranscript.trim()) {
      validateIndonesian(fullTranscript);
    }
  }, [transcript, interimTranscript, stopAudioStream, validateIndonesian]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const closeResult = () => {
    setShowResult(false);
  };

  const fullTranscript = transcript + interimTranscript;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-secondary/30 to-background">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Deteksi Bahasa Indonesia Baku
          </h1>
          <p className="text-muted-foreground text-lg">
            Tekan tombol mikrofon dan mulai berbicara dalam Bahasa Indonesia yang baku
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 bg-card shadow-xl border-secondary/50">
          {/* Microphone Button */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-accent/30 pulse-ring" />
                  <div className="absolute inset-0 rounded-full bg-accent/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              <button
                type="button"
                onClick={handleMicClick}
                className={`w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  isListening 
                    ? 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/30' 
                    : 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/30'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12 text-accent-foreground" />
                ) : (
                  <Mic className="w-12 h-12 text-secondary-foreground" />
                )}
              </button>
            </div>

            <p className={`text-lg font-medium ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
              {isListening ? 'Mendengarkan...' : 'Tekan untuk mulai'}
            </p>

            {/* Waveform */}
            <SpeechWaveform audioStream={audioStream} />

            {/* Live Transcript Preview */}
            {isListening && (
              <LiveTranscript 
                transcript={fullTranscript}
                isListening={isListening}
              />
            )}
          </div>

          {/* Final Transcript Display */}
          {!isListening && transcript && (
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Terdeteksi:</span>
              </div>
              <p className="text-lg text-foreground">{transcript}</p>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-secondary/20 border-secondary/30">
          <h3 className="font-semibold text-foreground mb-3">Petunjuk:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Gunakan bahasa Indonesia yang baku sesuai KBBI
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Hindari penggunaan bahasa slang atau bahasa daerah
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Berbicara dengan jelas dan tidak terlalu cepat
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