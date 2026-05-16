import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Loader2, MessageSquare, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResultPopup } from './ResultPopup';
import { SpeechWaveform } from './SpeechWaveform';
import { LiveTranscript } from './LiveTranscript';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { detectPidatoStructure, saveHistoryEntry, type PidatoStructure } from '@/lib/history';

export const SpeechDetector = forwardRef<HTMLDivElement>((_, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [pidatoMode, setPidatoMode] = useState(false);
  const [sentenceMode, setSentenceMode] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [resultTranscript, setResultTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detectedErrors, setDetectedErrors] = useState<Array<{ wrong: string; correct: string }>>([]);
  const [detectedStructure, setDetectedStructure] = useState<PidatoStructure | undefined>(undefined);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const recognitionRef = useRef<any>(null);

  const sentenceBufferRef = useRef('');
  const currentSentenceRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownResultRef = useRef(false);

  const finalTranscriptRef = useRef('');
  const pendingSentenceOnStopRef = useRef('');
  const shouldProcessOnEndRef = useRef(false);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const lastTranscriptSignatureRef = useRef('');

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
    dong: '', deh: '', sih: '', lah: '', kan: '', nih: '', tuh: '', loh: '', mah: '', teh: '', atuh: '', euy: '', weh: '',
    yg: 'yang', dgn: 'dengan', utk: 'untuk', krn: 'karena',
    jd: 'jadi', jgn: 'jangan', hrs: 'harus', blh: 'boleh',
    punten: 'permisi', abdi: 'saya', anjeun: 'Anda', teu: 'tidak', atos: 'sudah', bade: 'akan', kumaha: 'bagaimana',
    ora: 'tidak', opo: 'apa', piye: 'bagaimana', kowe: 'kamu', arep: 'ingin', wes: 'sudah', mboten: 'tidak', nggih: 'ya',
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

  const isMobileSpeechBrowser = useCallback(() => {
    const ua = navigator.userAgent;
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || isIPadOS;
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

  const mergeTranscriptText = useCallback(
    (base: string, addition: string) => {
      const normalizedBase = normalizeTranscript(base);
      const normalizedAddition = normalizeTranscript(addition);

      if (!normalizedAddition) return normalizedBase;
      if (!normalizedBase) return normalizedAddition;
      if (normalizedBase === normalizedAddition) return normalizedBase;
      if (normalizedAddition.startsWith(normalizedBase)) return normalizedAddition;
      if (normalizedBase.startsWith(normalizedAddition)) return normalizedBase;

      const baseTokens = normalizedBase.split(' ');
      const additionTokens = normalizedAddition.split(' ');
      let overlap = 0;

      for (let size = Math.min(baseTokens.length, additionTokens.length); size >= 1; size--) {
        if (baseTokens.slice(-size).join(' ') === additionTokens.slice(0, size).join(' ')) {
          overlap = size;
          break;
        }
      }

      return normalizeTranscript([...baseTokens, ...additionTokens.slice(overlap)].join(' '));
    },
    [normalizeTranscript],
  );

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetTranscriptState = useCallback(() => {
    setCurrentTranscript('');
    sentenceBufferRef.current = '';
    currentSentenceRef.current = '';
    finalTranscriptRef.current = '';
    pendingSentenceOnStopRef.current = '';
    shouldProcessOnEndRef.current = false;
    isStoppingRef.current = false;
    lastTranscriptSignatureRef.current = '';
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

  const cleanupRecognition = useCallback(
    (recognitionInstance?: any | null) => {
      if (recognitionInstance) {
        try {
          recognitionInstance.onstart = null;
          recognitionInstance.onend = null;
          recognitionInstance.onerror = null;
          recognitionInstance.onresult = null;
          recognitionInstance.onspeechstart = null;
          recognitionInstance.onspeechend = null;
        } catch (e) {
          console.log('Error cleaning recognition handlers:', e);
        }
      }

      if (!recognitionInstance || recognitionRef.current === recognitionInstance) {
        recognitionRef.current = null;
      }

      isStartingRef.current = false;
      isStoppingRef.current = false;
      setIsListening(false);
      setStatusMessage('');
      clearSilenceTimer();
    },
    [clearSilenceTimer],
  );

  const forceStopListening = useCallback(() => {
    shouldProcessOnEndRef.current = false;
    pendingSentenceOnStopRef.current = '';

    const recognition = recognitionRef.current;
    if (!recognition) {
      cleanupRecognition(null);
      return;
    }

    try {
      recognition.abort?.();
    } catch (e) {
      console.log('Error aborting recognition:', e);
    }

    cleanupRecognition(recognition);
  }, [cleanupRecognition]);

  const processSentence = useCallback(
    async (sentenceRaw: string) => {
      const sentence = normalizeTranscript(sentenceRaw);
      if (!sentence || hasShownResultRef.current) return;

      hasShownResultRef.current = true;
      setIsValidating(true);
      setStatusMessage('Memvalidasi dengan KBBI...');
      setResultTranscript(sentence);

      resetTranscriptState();

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
    [normalizeTranscript, resetTranscriptState, validateWithKBBI],
  );

  const getBufferedSentence = useCallback(() => {
    return normalizeTranscript(sentenceBufferRef.current || currentSentenceRef.current || finalTranscriptRef.current);
  }, [normalizeTranscript]);

  const requestStopListening = useCallback(() => {
    if (isStoppingRef.current) return;

    const bufferedSentence = getBufferedSentence();
    pendingSentenceOnStopRef.current = bufferedSentence;
    shouldProcessOnEndRef.current = Boolean(bufferedSentence);

    const recognition = recognitionRef.current;
    if (!recognition) {
      cleanupRecognition(null);
      if (bufferedSentence && sentenceMode && !hasShownResultRef.current) {
        void processSentence(bufferedSentence);
      } else {
        resetTranscriptState();
      }
      return;
    }

    isStoppingRef.current = true;
    setStatusMessage(bufferedSentence ? 'Memproses ucapan...' : 'Menghentikan mikrofon...');

    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition gracefully:', error);
      cleanupRecognition(recognition);

      if (bufferedSentence && sentenceMode && !hasShownResultRef.current) {
        void processSentence(bufferedSentence);
      } else {
        resetTranscriptState();
      }
    }
  }, [cleanupRecognition, getBufferedSentence, processSentence, resetTranscriptState, sentenceMode]);

  const scheduleSentenceProcessing = useCallback(() => {
    clearSilenceTimer();

    const delayMs = sentenceMode ? 1000 : 2000;
    silenceTimerRef.current = setTimeout(() => {
      if (!sentenceMode) {
        resetTranscriptState();
        return;
      }

      const sentence = getBufferedSentence();
      if (sentence && !hasShownResultRef.current) {
        requestStopListening();
        return;
      }

      resetTranscriptState();
    }, delayMs);
  }, [clearSilenceTimer, getBufferedSentence, requestStopListening, resetTranscriptState, sentenceMode]);

  const startListening = useCallback(() => {
    if (isStartingRef.current || recognitionRef.current) return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({
        title: 'Browser Tidak Didukung',
        description: 'Gunakan Chrome, Edge, atau Safari.',
        variant: 'destructive',
      });
      setStatusMessage('');
      isStartingRef.current = false;
      return;
    }

    isStartingRef.current = true;
    setStatusMessage('Menyalakan mikrofon...');

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = !isMobileSpeechBrowser();
      recognition.interimResults = true;
      recognition.lang = 'id-ID';
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      resetTranscriptState();
      setResultTranscript('');
      setShowResult(false);
      setDetectedErrors([]);
      setIsCorrect(false);
      hasShownResultRef.current = false;
      clearSilenceTimer();

      recognition.onstart = () => {
        isStartingRef.current = false;
        setStatusMessage('Mendengarkan... Silakan berbicara');
      };

      recognition.onspeechstart = () => {
        setStatusMessage('Berbicara...');
        clearSilenceTimer();
      };

      recognition.onresult = (event: any) => {
        const results: SpeechRecognitionResultList | undefined = event.results;
        if (!results) return;

        let rebuiltFinal = '';
        let interim = '';
        for (let i = 0; i < results.length; i++) {
          const res = results[i];
          const txt = (res?.[0]?.transcript || '').trim();
          if (!txt) continue;

          if (res.isFinal) {
            rebuiltFinal = mergeTranscriptText(rebuiltFinal, txt);
          } else {
            interim = mergeTranscriptText(interim, txt);
          }
        }

        const mergedFinal = mergeTranscriptText(finalTranscriptRef.current, rebuiltFinal);
        const combined = normalizeTranscript(`${mergedFinal} ${interim}`.trim());
        const hasMeaningfulChange = Boolean(combined) && combined !== lastTranscriptSignatureRef.current;

        finalTranscriptRef.current = mergedFinal;

        if (mergedFinal) {
          sentenceBufferRef.current = mergedFinal;
        }

        if (combined) {
          currentSentenceRef.current = combined;
          setCurrentTranscript(combined);
        }

        if (hasMeaningfulChange) {
          lastTranscriptSignatureRef.current = combined;
          scheduleSentenceProcessing();
        }
      };

      recognition.onspeechend = () => {
        setStatusMessage('Jeda terdeteksi...');
        if (sentenceBufferRef.current || currentSentenceRef.current) {
          scheduleSentenceProcessing();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        switch (event.error) {
          case 'no-speech': {
            const pendingSentence = getBufferedSentence();
            if (pendingSentence) {
              setStatusMessage('Jeda terdeteksi, memproses...');
              scheduleSentenceProcessing();
            } else {
              setStatusMessage('Belum ada suara terdeteksi...');
            }
            return;
          }
          case 'audio-capture':
            toast({
              title: 'Error Mikrofon',
              description: 'Tidak dapat menangkap audio.',
              variant: 'destructive',
            });
            forceStopListening();
            break;
          case 'not-allowed':
            toast({
              title: 'Izin Ditolak',
              description: 'Izinkan akses mikrofon di pengaturan browser.',
              variant: 'destructive',
            });
            forceStopListening();
            break;
          case 'service-not-allowed':
          case 'network':
            toast({
              title: 'Layanan Suara Tidak Tersedia',
              description: 'Coba tutup browser lain atau ulangi beberapa saat lagi.',
              variant: 'destructive',
            });
            forceStopListening();
            break;
          case 'aborted':
            return;
          default:
            console.log('Error:', event.error);
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return;

        const pendingSentence = normalizeTranscript(
          pendingSentenceOnStopRef.current
            ? mergeTranscriptText(pendingSentenceOnStopRef.current, getBufferedSentence())
            : getBufferedSentence(),
        );

        cleanupRecognition(recognition);

        if (sentenceMode && pendingSentence && !hasShownResultRef.current) {
          void processSentence(pendingSentence);
          return;
        }

        resetTranscriptState();
        setStatusMessage(pendingSentence ? '' : 'Belum ada kalimat yang tertangkap. Tekan mikrofon lalu coba lagi.');
      };

      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('Error starting:', err);
      setStatusMessage('');
      isStartingRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast({
          title: 'Izin Mikrofon Ditolak',
          description: 'Klik ikon gembok di address bar dan izinkan mikrofon.',
          variant: 'destructive',
        });
      } else if (err.name === 'InvalidStateError') {
        toast({
          title: 'Mikrofon Sedang Digunakan',
          description: 'Tunggu sebentar lalu tekan tombol mikrofon lagi.',
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
    }
  }, [clearSilenceTimer, cleanupRecognition, forceStopListening, getBufferedSentence, isMobileSpeechBrowser, mergeTranscriptText, normalizeTranscript, processSentence, resetTranscriptState, scheduleSentenceProcessing, sentenceMode]);

  const handleMicClick = () => {
    if (isListening) {
      requestStopListening();
      return;
    }

    startListening();
  };

  const closeResult = () => {
    setShowResult(false);
    setResultTranscript('');
    setDetectedErrors([]);
    setIsCorrect(false);
    resetTranscriptState();
    hasShownResultRef.current = false;
    clearSilenceTimer();
  };

  useEffect(() => {
    if (!showResult) return;

    resetTranscriptState();
    clearSilenceTimer();
  }, [clearSilenceTimer, resetTranscriptState, showResult]);

  useEffect(() => {
    return () => {
      forceStopListening();
    };
  }, [forceStopListening]);

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

            <SpeechWaveform isListening={isListening} />

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
                <span>Sistem akan menandai kata slang, non-KBBI, dan bahasa daerah seperti Sunda/Jawa</span>
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
