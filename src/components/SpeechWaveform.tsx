interface SpeechWaveformProps {
  isListening: boolean;
}

const activeHeights = [10, 18, 26, 16, 12, 22, 32, 18, 14, 24, 30, 20, 12, 18, 10];

export const SpeechWaveform = ({ isListening }: SpeechWaveformProps) => {
  return (
    <div className="flex flex-col items-center gap-2" aria-hidden="true">
      <div className="flex h-12 items-end justify-center gap-1">
        {activeHeights.map((height, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isListening ? 'bg-accent/70 animate-pulse' : 'bg-muted-foreground/30'
            }`}
            style={{
              height: isListening ? `${height}px` : '4px',
              animationDelay: `${index * 80}ms`,
            }}
          />
        ))}
      </div>

      {isListening && <p className="animate-pulse text-xs text-muted-foreground">Mikrofon aktif...</p>}
    </div>
  );
};