import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';
import { toast } from '@/hooks/use-toast';

export const SpeechDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [resultTranscript, setResultTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detectedErrors, setDetectedErrors] = useState<Array<{ wrong: string; correct: string }>>([]);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFinalUtteranceRef = useRef('');
  const processedFinalRef = useRef<Record<number, string>>({});
  const hasShownResultRef = useRef(false);

  // Expanded informal to formal word mapping
  const informalWords: Record<string, string> = {
    // Pronouns
    'gue': 'saya',
    'gua': 'saya',
    'gw': 'saya',
    'aku': 'saya',
    'lo': 'kamu',
    'lu': 'kamu',
    'elu': 'kamu',
    'loe': 'kamu',
    
    // Negation
    'kagak': 'tidak',
    'gak': 'tidak',
    'nggak': 'tidak',
    'enggak': 'tidak',
    'ga': 'tidak',
    'ngga': 'tidak',
    'tak': 'tidak',
    
    // Time/State
    'udah': 'sudah',
    'udeh': 'sudah',
    'dah': 'sudah',
    'belom': 'belum',
    'blm': 'belum',
    'lagi': 'sedang',
    'lg': 'sedang',
    
    // Question words
    'gimana': 'bagaimana',
    'gmn': 'bagaimana',
    'kok': 'mengapa',
    'kenapa': 'mengapa',
    'knp': 'mengapa',
    'dimana': 'di mana',
    'dmn': 'di mana',
    'kemana': 'ke mana',
    'kmn': 'ke mana',
    
    // Demonstratives
    'gitu': 'begitu',
    'gini': 'begini',
    'nih': '',
    'tuh': '',
    
    // Adverbs
    'emang': 'memang',
    'emg': 'memang',
    'banget': 'sangat',
    'bgt': 'sangat',
    'amat': 'sangat',
    
    // Only/Just
    'aja': 'saja',
    'doang': 'saja',
    'cuma': 'hanya',
    'cuman': 'hanya',
    'cmn': 'hanya',
    
    // Comparison
    'kayak': 'seperti',
    'kaya': 'seperti',
    'kek': 'seperti',
    
    // Verbs
    'bikin': 'membuat',
    'bkin': 'membuat',
    'ngomong': 'berbicara',
    'bilang': 'mengatakan',
    'blg': 'mengatakan',
    'nyari': 'mencari',
    'mau': 'ingin',
    'pengen': 'ingin',
    'pgn': 'ingin',
    'bisa': 'dapat',
    'bs': 'dapat',
    'pake': 'menggunakan',
    'pakai': 'menggunakan',
    'punya': 'memiliki',
    'tau': 'mengetahui',
    'tw': 'mengetahui',
    'ngerti': 'mengerti',
    'nanya': 'bertanya',
    'kasih': 'memberikan',
    'liat': 'melihat',
    'denger': 'mendengar',
    'mikir': 'berpikir',
    'ngerjain': 'mengerjakan',
    'kerjain': 'mengerjakan',
    
    // Conjunctions/Prepositions
    'sama': 'dengan',
    'ama': 'dengan',
    'ma': 'dengan',
    'buat': 'untuk',
    'bt': 'untuk',
    
    // Sequence
    'abis': 'setelah',
    'habis': 'setelah',
    'terus': 'kemudian',
    'trus': 'kemudian',
    'trs': 'kemudian',
    
    // Particles (should be avoided)
    'dong': '',
    'deh': '',
    'sih': '',
    'lah': '',
    'kan': '',
    'dongs': '',
    
    // Slang
    'asik': 'menyenangkan',
    'asyik': 'menyenangkan',
    'keren': 'bagus',
    'gokil': 'luar biasa',
    'mantap': 'bagus',
    'mantep': 'bagus',
    'anjir': '',
    'anjay': '',
    'wkwk': '',
    
    // Common informal
    'yg': 'yang',
    'dgn': 'dengan',
    'utk': 'untuk',
    'krn': 'karena',
    'krna': 'karena',
    'soalnya': 'karena',
    'jd': 'jadi',
    'jgn': 'jangan',
    'hrs': 'harus',
    'blh': 'boleh',
    'ato': 'atau',
    'atw': 'atau',
  };

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
    
    const foundInformal: Array<{wrong: string, correct: string}> = [];
    const seenWords = new Set<string>();
    
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:'"]/g, '');
      if (informalWords[cleanWord] !== undefined && !seenWords.has(cleanWord)) {
        seenWords.add(cleanWord);
        const correction = informalWords[cleanWord];
        foundInformal.push({
          wrong: cleanWord,
          correct: correction || '(hindari penggunaan kata ini)'
        });
      }
    }

    return foundInformal;
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

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';
      recognition.maxAlternatives = 1;
      
      recognitionRef.current = recognition;

      // Reset state
      setCurrentTranscript('');
      setResultTranscript('');
      setShowResult(false);
      setDetectedErrors([]);
      lastFinalUtteranceRef.current = '';
      processedFinalRef.current = {};
      hasShownResultRef.current = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setStatusMessage('Mendengarkan... Silakan berbicara');
      };

      recognition.onspeechstart = () => {
        console.log('Speech started');
        setStatusMessage('Berbicara...');
      };

       recognition.onresult = (event: any) => {
        let interim = '';

        // Only process new results to avoid duplicated text
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = (result?.[0]?.transcript || '').trim();
          if (!text) continue;

          if (result.isFinal) {
            // Some browsers re-emit the same final result multiple times.
            // Dedupe by (resultIndex + transcript).
            if (processedFinalRef.current[i] === text) continue;
            processedFinalRef.current[i] = text;

            lastFinalUtteranceRef.current = text;

            const errors = checkForInformalWords(text);
            if (errors.length > 0 && !hasShownResultRef.current) {
              hasShownResultRef.current = true;
              setResultTranscript(text);
              setIsCorrect(false);
              setDetectedErrors(errors);
              setShowResult(true);
              stopListening();
              return;
            }
          } else {
            interim = text;
          }
        }

        const combined = [lastFinalUtteranceRef.current, interim].filter(Boolean).join(' ').trim();
        setCurrentTranscript(combined);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setStatusMessage('Tidak ada suara, terus berbicara...');
            return;
          case 'audio-capture':
            toast({
              title: "Error Mikrofon",
              description: "Tidak dapat menangkap audio.",
              variant: "destructive"
            });
            stopListening();
            break;
          case 'not-allowed':
            toast({
              title: "Izin Ditolak",
              description: "Izinkan akses mikrofon di pengaturan browser.",
              variant: "destructive"
            });
            stopListening();
            break;
          case 'aborted':
            return;
          default:
            console.log('Error:', event.error);
        }
      };

      // NO auto-restart - mic turns off when recognition ends
      recognition.onend = () => {
        console.log('Recognition ended');
        // Don't auto-restart, let user control
      };

      recognition.start();
      setIsListening(true);
      console.log('Recognition started');
      
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
          description: "Pastikan mikrofon terhubung.",
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
    console.log('Mic clicked, isListening:', isListening);
    
    if (isListening) {
      stopListening();

      const snapshot = (lastFinalUtteranceRef.current || currentTranscript || '').trim();
      if (snapshot) {
        setResultTranscript(snapshot);
        const errors = checkForInformalWords(snapshot);
        if (errors.length > 0) {
          setIsCorrect(false);
          setDetectedErrors(errors);
        } else {
          setIsCorrect(true);
          setDetectedErrors([]);
        }
        setShowResult(true);
      }
    } else {
      startListening();
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setCurrentTranscript('');
    setResultTranscript('');
    setDetectedErrors([]);
    lastFinalUtteranceRef.current = '';
    processedFinalRef.current = {};
    hasShownResultRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopAudioStream();
    };
  }, [stopAudioStream]);

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
                  Gunakan Google Chrome, Microsoft Edge, atau Safari.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Card */}
        <Card className="p-8 bg-card shadow-xl border-secondary/50">
          <div className="flex flex-col items-center space-y-6">
            {/* Mic Button */}
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

            {/* Live Transcript */}
            {(isListening || currentTranscript) && (
              <LiveTranscript 
                transcript={currentTranscript}
                isListening={isListening}
              />
            )}
          </div>

          {/* Final Transcript */}
          {!isListening && currentTranscript && !showResult && (
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Terdeteksi:</span>
              </div>
              <p className="text-lg text-foreground">{currentTranscript}</p>
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
        errors={detectedErrors}
        transcript={resultTranscript}
        onClose={closeResult}
      />
    </div>
  );
};
