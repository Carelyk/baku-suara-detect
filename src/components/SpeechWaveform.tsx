export const SpeechWaveform = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-accent rounded-full speech-wave"
          style={{
            height: '100%',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
