import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SpeechDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
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
  const sentenceBufferRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownResultRef = useRef(false);
  const currentSentenceRef = useRef('');

  // Fallback informal word mapping (used if API fails)
  const informalWords: Record<string, string> = {
    'gue': 'saya', 'gua': 'saya', 'gw': 'saya', 'aku': 'saya',
    'lo': 'kamu', 'lu': 'kamu', 'elu': 'kamu', 'loe': 'kamu',
    'kagak': 'tidak', 'gak': 'tidak', 'nggak': 'tidak', 'enggak': 'tidak', 'ga': 'tidak', 'ngga': 'tidak',
    'udah': 'sudah', 'udeh': 'sudah', 'dah': 'sudah',
    'belom': 'belum', 'blm': 'belum',
    'gimana': 'bagaimana', 'gmn': 'bagaimana',
    'kok': 'mengapa', 'kenapa': 'mengapa', 'knp': 'mengapa',
    'gitu': 'begitu', 'gini': 'begini',
    'emang': 'memang', 'emg': 'memang',
    'banget': 'sangat', 'bgt': 'sangat',
    'aja': 'saja', 'doang': 'saja',
    'cuma': 'hanya', 'cuman': 'hanya',
    'kayak': 'seperti', 'kaya': 'seperti', 'kek': 'seperti',
    'bikin': 'membuat', 'ngomong': 'berbicara',
    'bilang': 'mengatakan', 'nyari': 'mencari',
    'mau': 'ingin', 'pengen': 'ingin', 'pgn': 'ingin',
    'pake': 'menggunakan', 'pakai': 'menggunakan',
    'punya': 'memiliki', 'tau': 'mengetahui',
    'ngerti': 'mengerti', 'nanya': 'bertanya',
    'kasih': 'memberikan', 'liat': 'melihat',
    'denger': 'mendengar', 'mikir': 'berpikir',
    'sama': 'dengan', 'ama': 'dengan',
    'buat': 'untuk', 'abis': 'setelah', 'habis': 'setelah',
    'terus': 'kemudian', 'trus': 'kemudian',
    'dong': '', 'deh': '', 'sih': '', 'lah': '', 'kan': '', 'nih': '', 'tuh': '',
    'yg': 'yang', 'dgn': 'dengan', 'utk': 'untuk', 'krn': 'karena',
    'jd': 'jadi', 'jgn': 'jangan', 'hrs': 'harus', 'blh': 'boleh',
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

  // Validate using KBBI Cloud Function
  const validateWithKBBI = useCallback(async (text: string): Promise<Array<{ wrong: string; correct: string }>> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-kbbi', {
        body: { text }
      });
      
      if (error) {
        console.error('KBBI validation error:', error);
        throw error;
      }
      
      if (data && !data.isValid && Array.isArray(data.errors)) {
        return data.errors;
      }
      
      return [];
    } catch (err) {
      console.error('Failed to validate with KBBI API, using fallback:', err);
      // Fallback to local validation
      return checkForInformalWordsLocal(text);
    }
  }, []);

  // Local fallback validation
  const checkForInformalWordsLocal = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const foundInformal: Array<{ wrong: string; correct: string }> = [];
    const seenWords = new Set<string>();

    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:'"]/g, '');
      if (informalWords[cleanWord] !== undefined && !seenWords.has(cleanWord)) {
        seenWords.add(cleanWord);
        const correction = informalWords[cleanWord];
        foundInformal.push({
          wrong: cleanWord,
          correct: correction || '(hindari penggunaan kata ini)',
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
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
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

  // Process and validate a complete sentence
  const processSentence = useCallback(async (sentence: string) => {
    if (!sentence.trim() || hasShownResultRef.current) return;
    
    console.log('Processing sentence:', sentence);
    setIsValidating(true);
    setStatusMessage('Memvalidasi dengan KBBI...');
    
    try {
      const errors = await validateWithKBBI(sentence);
      
      if (errors.length > 0) {
        hasShownResultRef.current = true;
        setResultTranscript(sentence);
        setIsCorrect(false);
        setDetectedErrors(errors);
        setShowResult(true);
        stopListening();
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
      setStatusMessage(hasShownResultRef.current ? '' : 'Mendengarkan... Silakan berbicara');
    }
  }, [validateWithKBBI, stopListening]);

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
      sentenceBufferRef.current = '';
      currentSentenceRef.current = '';
      hasShownResultRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setStatusMessage('Mendengarkan... Silakan berbicara');
      };

      recognition.onspeechstart = () => {
        console.log('Speech started');
        setStatusMessage('Berbicara...');
        // Clear silence timer when speech starts
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognition.onresult = (event: any) => {
        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        // Get only the current result (not accumulated)
        let interimText = '';
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          
          if (result.isFinal) {
            finalText = transcript;
          } else {
            interimText = transcript;
          }
        }

        // Display only the current sentence being spoken (not accumulated)
        const displayText = finalText || interimText;
        if (displayText) {
          currentSentenceRef.current = displayText;
          setCurrentTranscript(displayText);
        }

        // When we get a final result, process it
        if (finalText) {
          sentenceBufferRef.current = finalText;
        }

        // Auto-stop after silence (sentence detection mode: ~1000ms)
        silenceTimerRef.current = setTimeout(() => {
          const sentence = sentenceBufferRef.current || currentSentenceRef.current;
          if (sentence.trim() && !hasShownResultRef.current) {
            processSentence(sentence.trim());
          }
          // Clear transcript after 2 seconds of silence
          setCurrentTranscript('');
          sentenceBufferRef.current = '';
          currentSentenceRef.current = '';
        }, 1000);
      };

      recognition.onspeechend = () => {
        console.log('Speech ended');
        setStatusMessage('Jeda terdeteksi...');
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
  }, [processSentence, stopAudioStream, stopListening]);

  const handleMicClick = async () => {
    console.log('Mic clicked, isListening:', isListening);
    
    if (isListening) {
      stopListening();

      const sentence = (sentenceBufferRef.current || currentSentenceRef.current || '').trim();
      if (sentence && !hasShownResultRef.current) {
        setIsValidating(true);
        setStatusMessage('Memvalidasi...');
        
        try {
          const errors = await validateWithKBBI(sentence);
          setResultTranscript(sentence);
          if (errors.length > 0) {
            setIsCorrect(false);
            setDetectedErrors(errors);
          } else {
            setIsCorrect(true);
            setDetectedErrors([]);
          }
          setShowResult(true);
        } catch (err) {
          console.error('Final validation error:', err);
          // Fallback to local
          const errors = checkForInformalWordsLocal(sentence);
          setResultTranscript(sentence);
          setIsCorrect(errors.length === 0);
          setDetectedErrors(errors);
          setShowResult(true);
        } finally {
          setIsValidating(false);
          setStatusMessage('');
        }
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
    sentenceBufferRef.current = '';
    currentSentenceRef.current = '';
    hasShownResultRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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
                disabled={!browserSupported || isValidating}
                className={`w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening 
                    ? 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/30' 
                    : 'bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/30'
                }`}
              >
                {isValidating ? (
                  <Loader2 className="w-12 h-12 text-secondary-foreground animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-12 h-12 text-accent-foreground" />
                ) : (
                  <Mic className="w-12 h-12 text-secondary-foreground" />
                )}
              </button>
            </div>

            <div className="text-center">
              <p className={`text-lg font-medium ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
                {isValidating ? 'Memvalidasi...' : isListening ? 'Tekan untuk berhenti' : 'Tekan untuk mulai'}
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
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Jeda 1 detik untuk auto-validasi per kalimat
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
