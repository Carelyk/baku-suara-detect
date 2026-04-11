import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
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
  errors: Array<{ wrong: string; correct: string }>;
  transcript: string;
  onClose: () => void;
}

export const ResultPopup = ({ isOpen, isCorrect, errors, transcript, onClose }: ResultPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto border-2 sm:max-w-md ${
          isCorrect
            ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5'
            : 'border-destructive bg-destructive/5'
        }`}
      >
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4 text-center">
            {isCorrect ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--success))]/20">
                <CheckCircle2 className="h-12 w-12 text-[hsl(var(--success))]" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
            )}

            <DialogTitle className={`text-2xl font-bold ${isCorrect ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
              {isCorrect ? 'BENAR!' : 'KATA TIDAK BAKU!'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-sm text-muted-foreground">Kalimat yang diucapkan:</p>
            <p className="break-words font-medium text-foreground">"{transcript}"</p>
          </div>

          {!isCorrect && errors.length > 0 && (
            <div className="space-y-3 rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-semibold text-destructive">Perbaikan kata:</p>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded bg-background/50 p-2"
                  >
                    <span className="break-all font-medium text-destructive line-through">
                      "{error.wrong}"
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="break-all font-medium text-[hsl(var(--success))]">
                      "{error.correct}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCorrect && (
            <div className="rounded-lg bg-[hsl(var(--success))]/10 p-4">
              <p className="text-center text-[hsl(var(--success))]">
                Kalimat Anda sudah menggunakan Bahasa Indonesia Baku yang benar!
              </p>
            </div>
          )}

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
