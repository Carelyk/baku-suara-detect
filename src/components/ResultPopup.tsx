import { CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResultPopupProps {
  isOpen: boolean;
  isCorrect: boolean;
  message: string;
  transcript: string;
  onClose: () => void;
}

export const ResultPopup = ({ isOpen, isCorrect, message, transcript, onClose }: ResultPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-md border-2 ${
          isCorrect 
            ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5' 
            : 'border-destructive bg-destructive/5'
        }`}
      >
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {isCorrect ? (
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--success))]/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))]" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            )}
            
            <DialogTitle className={`text-2xl font-bold ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
              {isCorrect ? 'BENAR!' : 'SALAH!'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transcript */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Anda mengatakan:</p>
            <p className="text-foreground font-medium">"{transcript}"</p>
          </div>

          {/* Message */}
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-[hsl(var(--success))]/10' : 'bg-destructive/10'}`}>
            <p className={`whitespace-pre-line ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
              {message}
            </p>
          </div>

          <Button 
            onClick={onClose} 
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Coba Lagi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
