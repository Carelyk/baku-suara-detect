import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';
import { toast } from '@/hooks/use-toast';

export const SpeechDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef(false);

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

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setBrowserSupported(false);
      toast({
        title: "Browser Tidak Didukung",
        description: "Gunakan Chrome, Edge, atau Safari untuk fitur speech recognition.",
        variant: "destructive"
      });
    }
  }, []);

  const checkForInformalWords = useCallback((text: string) => {
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
      return { hasError: true, errors: foundInformal };
    }
    return { hasError: false, errors: [] };
  }, []);

  const stopAudioStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setAudioStream(null);
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log('Stopping listening...');
    isListeningRef.current = false;
    setIsListening(false);
    setStatusMessage('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    stopAudioStream();
  }, [stopAudioStream]);

  const startListening = useCallback(async () => {
    console.log('Starting listening...');
    setStatusMessage('Meminta izin mikrofon...');
    
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Browser Tidak Didukung",
        description: "Gunakan Chrome, Edge, atau Safari.",
        variant: "destructive"
      });
      setStatusMessage('');
      return;
    }

    try {
      // First get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      console.log('Microphone access granted');
      streamRef.current = stream;
      setAudioStream(stream);
      setStatusMessage('Mikrofon aktif, mulai berbicara...');

      // Create and setup recognition
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';
      recognition.maxAlternatives = 1;
      
      recognitionRef.current = recognition;

      // Reset state
      setTranscript('');
      setInterimTranscript('');
      setShowResult(false);

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setStatusMessage('Mendengarkan... Silakan berbicara');
      };

      recognition.onaudiostart = () => {
        console.log('Audio capturing started');
      };

      recognition.onsoundstart = () => {
        console.log('Sound detected');
        setStatusMessage('Suara terdeteksi...');
      };

      recognition.onspeechstart = () => {
        console.log('Speech started');
        setStatusMessage('Berbicara...');
      };

      recognition.onresult = (event: any) => {
        console.log('Got result:', event.results);
        let interim = '';
        let final = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          
          if (result.isFinal) {
            final += transcriptText + ' ';
            
            // Check for informal words in real-time
            const check = checkForInformalWords(transcriptText);
            if (check.hasError) {
              setIsCorrect(false);
              setErrorMessage(`Ditemukan kata tidak baku:\n${check.errors.join('\n')}`);
              setShowResult(true);
            }
          } else {
            interim += transcriptText;
          }
        }
        
        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        
        switch (event.error) {
          case 'no-speech':
            // This is normal, just keep listening
            console.log('No speech detected, continuing...');
            setStatusMessage('Tidak ada suara terdeteksi, terus berbicara...');
            return;
          case 'audio-capture':
            toast({
              title: "Error Mikrofon",
              description: "Tidak dapat menangkap audio. Periksa mikrofon Anda.",
              variant: "destructive"
            });
            break;
          case 'not-allowed':
            toast({
              title: "Izin Ditolak",
              description: "Izinkan akses mikrofon di pengaturan browser.",
              variant: "destructive"
            });
            break;
          case 'network':
            toast({
              title: "Error Jaringan",
              description: "Periksa koneksi internet Anda.",
              variant: "destructive"
            });
            break;
          case 'aborted':
            console.log('Recognition aborted');
            return;
          default:
            console.log('Unknown error:', event.error);
        }
        
        // Only stop on critical errors
        if (['not-allowed', 'audio-capture', 'network'].includes(event.error)) {
          stopListening();
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, isListeningRef:', isListeningRef.current);
        
        // Auto-restart if still supposed to be listening
        if (isListeningRef.current && recognitionRef.current) {
          console.log('Restarting recognition...');
          setTimeout(() => {
            try {
              if (isListeningRef.current && recognitionRef.current) {
                recognitionRef.current.start();
              }
            } catch (e) {
              console.log('Could not restart recognition:', e);
            }
          }, 100);
        }
      };

      // Start recognition
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
      
      console.log('Recognition started successfully');
      
    } catch (err: any) {
      console.error('Error starting:', err);
      setStatusMessage('');
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast({
          title: "Izin Mikrofon Ditolak",
          description: "Klik ikon gembok di address bar dan izinkan mikrofon.",
          variant: "destructive"
        });
      } else if (err.name === 'NotFoundError') {
        toast({
          title: "Mikrofon Tidak Ditemukan",
          description: "Pastikan mikrofon terhubung ke perangkat.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Gagal mengakses mikrofon.",
          variant: "destructive"
        });
      }
      
      stopAudioStream();
    }
  }, [checkForInformalWords, stopAudioStream, stopListening]);

  const handleMicClick = () => {
    console.log('Mic clicked, current state:', isListening);
    
    if (isListening) {
      stopListening();
      
      // Validate final transcript
      const fullTranscript = transcript + interimTranscript;
      if (fullTranscript.trim()) {
        const result = checkForInformalWords(fullTranscript);
        if (result.hasError) {
          setIsCorrect(false);
          setErrorMessage(`Ditemukan kata tidak baku:\n${result.errors.join('\n')}`);
        } else {
          setIsCorrect(true);
          setErrorMessage('');
        }
        setShowResult(true);
      }
    } else {
      startListening();
    }
  };

  const closeResult = () => {
    setShowResult(false);
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopAudioStream();
    };
  }, [stopAudioStream]);

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

        {/* Browser Warning */}
        {!browserSupported && (
          <Card className="p-4 bg-destructive/10 border-destructive/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Browser Tidak Didukung</p>
                <p className="text-sm text-muted-foreground">
                  Gunakan Google Chrome, Microsoft Edge, atau Safari untuk fitur speech recognition.
                </p>
              </div>
            </div>
          </Card>
        )}

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
                disabled={!browserSupported}
                className={`w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
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

            <div className="text-center">
              <p className={`text-lg font-medium ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
                {isListening ? 'Tekan untuk berhenti' : 'Tekan untuk mulai'}
              </p>
              {statusMessage && (
                <p className="text-sm text-muted-foreground mt-1">{statusMessage}</p>
              )}
            </div>

            {/* Waveform */}
            <SpeechWaveform audioStream={audioStream} />

            {/* Live Transcript Preview */}
            {(isListening || fullTranscript) && (
              <LiveTranscript 
                transcript={fullTranscript}
                isListening={isListening}
              />
            )}
          </div>

          {/* Final Transcript Display */}
          {!isListening && transcript && !showResult && (
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
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Pop-up akan muncul jika kata tidak baku terdeteksi
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
