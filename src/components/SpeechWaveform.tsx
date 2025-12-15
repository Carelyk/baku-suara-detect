import { useEffect, useRef, useState } from 'react';

interface SpeechWaveformProps {
  audioStream?: MediaStream | null;
}

export const SpeechWaveform = ({ audioStream }: SpeechWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!audioStream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume level
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setAudioLevel(average);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform bars
      const barCount = 15;
      const barWidth = 4;
      const gap = 3;
      const totalWidth = barCount * barWidth + (barCount - 1) * gap;
      const startX = (canvas.width - totalWidth) / 2;
      const maxHeight = canvas.height * 0.9;
      const minHeight = 4;

      for (let i = 0; i < barCount; i++) {
        // Get frequency data for this bar
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.5);
        const value = dataArray[dataIndex] || 0;
        
        // Calculate bar height based on audio data
        const normalizedValue = value / 255;
        const height = Math.max(minHeight, normalizedValue * maxHeight);
        
        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - height) / 2;

        // Create gradient for bar
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'hsl(200, 80%, 70%)');
        gradient.addColorStop(1, 'hsl(200, 80%, 50%)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [audioStream]);

  // Fallback static bars when no audio stream
  if (!audioStream) {
    return (
      <div className="flex items-center justify-center gap-1 h-12">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-muted-foreground/30 rounded-full"
            style={{ height: '4px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={200}
        height={48}
        className="w-[200px] h-12"
      />
      {audioLevel > 10 && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Mendeteksi suara...
        </p>
      )}
    </div>
  );
};