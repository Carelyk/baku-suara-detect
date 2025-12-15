interface LiveTranscriptProps {
  transcript: string;
  isListening: boolean;
}

export const LiveTranscript = ({ transcript, isListening }: LiveTranscriptProps) => {
  if (!isListening && !transcript) return null;

  return (
    <div className="w-full max-w-md">
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 min-h-[60px]">
        {transcript ? (
          <p className="text-foreground text-center leading-relaxed">
            {transcript}
            <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />
          </p>
        ) : (
          <p className="text-muted-foreground/50 text-center text-sm italic">
            Mulai berbicara...
          </p>
        )}
      </div>
    </div>
  );
};