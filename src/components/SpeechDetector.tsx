import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SpeechDetector = forwardRef<HTMLDivElement>((_, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [sentenceMode, setSentenceMode] = useState(true);
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
  const currentSentenceRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownResultRef = useRef(false);

  const finalTranscriptRef = useRef('');
  const finalHandledUpToRef = useRef(0);

  const informalWords: Record<string, string> = {
    gue: 'saya', gua: 'saya', gw: 'saya', aku: 'saya',
    lo: 'kamu', lu: 'kamu', elu: 'kamu', loe: 'kamu',
    kagak: 'tidak', gak: 'tidak', nggak: 'tidak', enggak: 'tidak', ga: 'tidak', ngga: 'tidak',
    udah: 'sudah', udeh: 'sudah', dah: 'sudah',
    belom: 'belum', blm: 'belum',
    gimana: 'bagaimana', gmn: 'bagaimana',
    kok: 'mengapa', kenapa: 'mengapa', knp: 'mengapa',
    gitu: 'begitu', gini: 'begini',
    emang: 'memang', emg: 'memang',
    banget: 'sangat', bgt: 'sangat',
    aja: 'saja', doang: 'saja',
    cuma: 'hanya', cuman: 'hanya',
    kayak: 'seperti', kaya: 'seperti', kek: 'seperti',
    bikin: 'membuat', ngomong: 'berbicara',
    bilang: 'mengatakan', nyari: 'mencari',
    mau: 'ingin', pengen: 'ingin', pgn: 'ingin',
    pake: 'menggunakan', pakai: 'menggunakan',
    punya: 'memiliki', tau: 'mengetahui',
    ngerti: 'mengerti', nanya: 'bertanya',
    kasih: 'memberikan', liat: 'melihat',
    denger: 'mendengar', mikir: 'berpikir',
    sama: 'dengan', ama: 'dengan',
    buat: 'untuk', abis: 'setelah', habis: 'setelah',
    terus: 'kemudian', trus: 'kemudian',
    dong: '', deh: '', sih: '', lah: '', kan: '', nih: '', tuh: '',
    yg: 'yang', dgn: 'dengan', utk: 'untuk', krn: 'karena',
    jd: 'jadi', jgn: 'jangan', hrs: 'harus', blh: 'boleh',
  };

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setBrowserSupported(false);
      toast({
        title: 'Browser Tidak Didukung',
        description: 'Gunakan Chrome, Edge, atau Safari untuk fitur speech recognition.',
        variant: 'destructive',
      });
    }
  }, []);

  const normalizeTranscript = useCallback((input: string) => {
    const collapsed = input.replace(/\s+/g, ' ').trim();
    if (!collapsed) return '';

    const rawTokens = collapsed.split(' ');
    const tokens: string[] = [];
    const normTokens: string[] = [];

    const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

    for (const token of rawTokens) {
      const n = norm(token);
      if (!n) continue;
      if (normTokens.length > 0 && n === normTokens[normTokens.length - 1]) continue;

      tokens.push(token);
      normTokens.push(n);

      for (let size = 6; size >= 2; size--) {
        if (normTokens.length < size * 2) continue;
        const a = normTokens.slice(normTokens.length - size).join('|');
        const b = normTokens.slice(normTokens.length - size * 2, normTokens.length - size).join('|');
        if (a === b) {
          tokens.splice(tokens.length - size, size);
          normTokens.splice(normTokens.length - size, size);
          break;
        }
      }
    }

    return tokens.join(' ').replace(/\s+/g, ' ').trim();
  }, []);

  const checkForInformalWordsLocal = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const found: Array<{ wrong: string; correct: string }> = [];
    const seen = new Set<string>();

    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:'"]/g, '');
      if (informalWords[cleanWord] !== undefined && !seen.has(cleanWord)) {
        seen.add(cleanWord);
        const correction = informalWords[cleanWord];
        found.push({
          wrong: cleanWord,
          correct: correction || '(hindari penggunaan kata ini)',
        });
      }
    }

    return found;
  }, []);

  type KbbiValidation = {
    errors: Array<{ wrong: string; correct: string }>;
    language: 'id' | 'non-id' | 'unknown';
  };

  const validateWithKBBI = useCallback(
    async (text: string): Promise<KbbiValidation> => {
      const cleaned = normalizeTranscript(text);
      if (!cleaned) return { errors: [], language: 'unknown' };

      try {
        const { data, error } = await supabase.functions.invoke('validate-kbbi', {
          body: { text: cleaned },
        });

        if (error) {
          console.error('KBBI validation error:', error);
          throw error;
        }

        const language: KbbiValidation['language'] =
          data?.language === 'id' || data?.language === 'non-id' ? data.language : 'unknown';

        const errors = data && data.isValid === false && Array.isArray(data.errors) ? data.errors : [];
        return { errors, language };
      } catch (err: any) {
        console.error('Failed to validate with KBBI API, using fallback:', err);
        return { errors: checkForInformalWordsLocal(cleaned), language: 'unknown' };
      }
    },
    [normalizeTranscript, checkForInformalWordsLocal],
  );

  const stopAudioStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setAudioStream(null);
    }
  }, []);

  const stopListening = useCallback(() => {
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

  const processSentence = useCallback(
    async (sentenceRaw: string) => {
      const sentence = normalizeTranscript(sentenceRaw);
      if (!sentence || hasShownResultRef.current) return;

      hasShownResultRef.current = true;
      setIsValidating(true);
      setStatusMessage('Memvalidasi dengan KBBI...');
      setResultTranscript(sentence);

      setCurrentTranscript('');
      sentenceBufferRef.current = '';
      currentSentenceRef.current = '';
      finalTranscriptRef.current = '';
      finalHandledUpToRef.current = 0;

      let shouldShowResult = true;

      try {
        const { errors, language } = await validateWithKBBI(sentence);

        if (language === 'non-id') {
          toast({
            title: 'Bahasa tidak didukung',
            description: 'Terdeteksi bahasa non-Indonesia. Silakan gunakan Bahasa Indonesia.',
          });
          shouldShowResult = false;
          setDetectedErrors([]);
          setIsCorrect(false);
          hasShownResultRef.current = false;
        } else {
          setDetectedErrors(errors);
          setIsCorrect(errors.length === 0);
        }
      } catch (err) {
        console.error('Validation error:', err);
        setDetectedErrors([]);
        setIsCorrect(true);
      } finally {
        setIsValidating(false);
        setStatusMessage('');
        setShowResult(shouldShowResult);
      }
    },
    [normalizeTranscript, validateWithKBBI],
  );

  const startListening = useCallback(async () => {
    setStatusMessage('Meminta izin mikrofon...');

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({
        title: 'Browser Tidak Didukung',
        description: 'Gunakan Chrome, Edge, atau Safari.',
        variant: 'destructive',
      });
      setStatusMessage('');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      setAudioStream(stream);
      setStatusMessage('Mikrofon aktif, mulai berbicara...');

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      setCurrentTranscript('');
      setResultTranscript('');
      setShowResult(false);
      setDetectedErrors([]);
      setIsCorrect(false);
      sentenceBufferRef.current = '';
      currentSentenceRef.current = '';
      finalTranscriptRef.current = '';
      finalHandledUpToRef.current = 0;
      hasShownResultRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      recognition.onstart = () => {
        setStatusMessage('Mendengarkan... Silakan berbicara');
      };

      recognition.onspeechstart = () => {
        setStatusMessage('Berbicara...');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognition.onresult = (event: any) => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        const results: SpeechRecognitionResultList | undefined = event.results;
        if (!results) return;

        let interim = '';
        for (let i = event.resultIndex; i < results.length; i++) {
          const res = results[i];
          const txt = (res?.[0]?.transcript || '').trim();
          if (!txt) continue;

          if (res.isFinal) {
            if (i >= finalHandledUpToRef.current) {
              finalTranscriptRef.current = `${finalTranscriptRef.current} ${txt}`.trim();
              finalHandledUpToRef.current = i + 1;
            }
          } else {
            interim = `${interim} ${txt}`.trim();
          }
        }

        const combined = normalizeTranscript(`${finalTranscriptRef.current} ${interim}`.trim());

        if (combined) {
          currentSentenceRef.current = combined;
          setCurrentTranscript(combined);
        }

        if (finalTranscriptRef.current) {
          sentenceBufferRef.current = normalizeTranscript(finalTranscriptRef.current);
        }

        const delayMs = sentenceMode ? 1000 : 2000;
        silenceTimerRef.current = setTimeout(() => {
          if (!sentenceMode) {
            setCurrentTranscript('');
            sentenceBufferRef.current = '';
            currentSentenceRef.current = '';
            finalTranscriptRef.current = '';
            finalHandledUpToRef.current = 0;
            return;
          }

          const sentence = sentenceBufferRef.current || currentSentenceRef.current;
          if (sentence && !hasShownResultRef.current) {
            stopListening();
            processSentence(sentence);
          }

          setCurrentTranscript('');
          sentenceBufferRef.current = '';
          currentSentenceRef.current = '';
          finalTranscriptRef.current = '';
          finalHandledUpToRef.current = 0;
        }, delayMs);
      };

      recognition.onspeechend = () => {
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
              title: 'Error Mikrofon',
              description: 'Tidak dapat menangkap audio.',
              variant: 'destructive',
            });
            stopListening();
            break;
          case 'not-allowed':
            toast({
              title: 'Izin Ditolak',
              description: 'Izinkan akses mikrofon di pengaturan browser.',
              variant: 'destructive',
            });
            stopListening();
            break;
          case 'aborted':
            return;
          default:
            console.log('Error:', event.error);
        }
      };

      recognition.onend = () => {};

      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('Error starting:', err);
      setStatusMessage('');

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast({
          title: 'Izin Mikrofon Ditolak',
          description: 'Klik ikon gembok di address bar dan izinkan mikrofon.',
          variant: 'destructive',
        });
      } else if (err.name === 'NotFoundError') {
        toast({
          title: 'Mikrofon Tidak Ditemukan',
          description: 'Pastikan mikrofon terhubung.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Gagal mengakses mikrofon.',
          variant: 'destructive',
        });
      }

      stopAudioStream();
    }
  }, [normalizeTranscript, sentenceMode, processSentence, stopAudioStream, stopListening]);

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
      const sentence = (sentenceBufferRef.current || currentSentenceRef.current || currentTranscript).trim();
      sentenceBufferRef.current = '';
      currentSentenceRef.current = '';
      if (sentence) await processSentence(sentence);
      return;
    }

    startListening();
  };

  const closeResult = () => {
    setShowResult(false);
    setCurrentTranscript('');
    setResultTranscript('');
    setDetectedErrors([]);
    setIsCorrect(false);
    sentenceBufferRef.current = '';
    currentSentenceRef.current = '';
    finalTranscriptRef.current = '';
    finalHandledUpToRef.current = 0;
    hasShownResultRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  useEffect(() => {
    if (!showResult) return;

    setCurrentTranscript('');
    sentenceBufferRef.current = '';
    currentSentenceRef.current = '';
    finalTranscriptRef.current = '';
    finalHandledUpToRef.current = 0;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [showResult]);

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
    <div
      ref={ref}
      className="min-h-screen overflow-x-hidden bg-gradient-to-b from-secondary/30 to-background px-4 pb-6 pt-24 sm:flex sm:flex-col sm:items-center sm:justify-center sm:px-6 sm:py-8"
    >
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        <div className="space-y-2 text-center sm:space-y-3">
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl">
            Deteksi Bahasa Indonesia Baku
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-lg">
            Tekan tombol mikrofon dan mulai berbicara dalam Bahasa Indonesia yang baku
          </p>
        </div>

        {!browserSupported && (
          <Card className="border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive sm:h-6 sm:w-6" />
              <div>
                <p className="font-medium text-destructive">Browser Tidak Didukung</p>
                <p className="text-sm text-muted-foreground">
                  Gunakan Google Chrome, Microsoft Edge, atau Safari.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="border-secondary/50 bg-card p-5 shadow-xl sm:p-8">
          <div className="flex flex-col items-center space-y-5 sm:space-y-6">
            <div className="relative">
              {isListening && (
                <>
                  <div className="pulse-ring absolute inset-0 rounded-full bg-accent/30" />
                  <div className="pulse-ring absolute inset-0 rounded-full bg-accent/20" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              <button
                type="button"
                aria-label={isListening ? 'Hentikan rekaman' : 'Mulai rekaman'}
                onClick={handleMicClick}
                disabled={!browserSupported || isValidating}
                className={`flex h-28 w-28 items-center justify-center rounded-full border-0 outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 sm:h-32 sm:w-32 ${
                  isListening
                    ? 'bg-accent shadow-lg shadow-accent/30 hover:bg-accent/90'
                    : 'bg-secondary shadow-lg shadow-secondary/30 hover:bg-secondary/90'
                }`}
              >
                {isValidating ? (
                  <Loader2 className="h-10 w-10 animate-spin text-secondary-foreground sm:h-12 sm:w-12" />
                ) : isListening ? (
                  <MicOff className="h-10 w-10 text-accent-foreground sm:h-12 sm:w-12" />
                ) : (
                  <Mic className="h-10 w-10 text-secondary-foreground sm:h-12 sm:w-12" />
                )}
              </button>
            </div>

            <div className="text-center">
              <p className={`text-base font-medium sm:text-lg ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
                {isValidating ? 'Memvalidasi...' : isListening ? 'Tekan untuk berhenti' : 'Tekan untuk mulai'}
              </p>
              {statusMessage && <p className="mt-1 text-sm text-muted-foreground">{statusMessage}</p>}
            </div>

            <SpeechWaveform audioStream={audioStream} />

            {(isListening || currentTranscript) && (
              <LiveTranscript transcript={currentTranscript} isListening={isListening} />
            )}
          </div>

          {!isListening && currentTranscript && !showResult && (
            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 sm:mt-8">
              <div className="mb-2 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Terdeteksi:</span>
              </div>
              <p className="break-words text-base text-foreground sm:text-lg">{currentTranscript}</p>
            </div>
          )}
        </Card>

        <Card className="border-secondary/30 bg-secondary/20 p-5 sm:p-6">
          <h3 className="mb-3 font-semibold text-foreground">Petunjuk:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Gunakan bahasa Indonesia yang baku sesuai KBBI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Hindari penggunaan bahasa slang atau bahasa daerah</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Berbicara dengan jelas dan tidak terlalu cepat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>Jeda 1 detik untuk auto-validasi per kalimat</span>
            </li>
          </ul>
        </Card>
      </div>

      <ResultPopup
        isOpen={showResult}
        isCorrect={isCorrect}
        errors={detectedErrors}
        transcript={resultTranscript}
        onClose={closeResult}
      />
    </div>
  );
});

SpeechDetector.displayName = 'SpeechDetector';
