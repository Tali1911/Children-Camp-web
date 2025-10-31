import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';

interface QRScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (qrCodeData: string) => void;
}

export const QRScannerDialog = ({ open, onClose, onScanSuccess }: QRScannerDialogProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) {
      // Cleanup when dialog closes
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      setError('');
      return;
    }

    // Wait for DOM element to be available before initializing scanner
    const initScanner = () => {
      const element = document.getElementById('qr-reader');
      if (!element) {
        console.warn('QR reader element not found, retrying...');
        setTimeout(initScanner, 100);
        return;
      }

      // Initialize scanner when dialog opens and element exists
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: { ideal: "environment" }
          }
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
          scanner.clear().catch(console.error);
          scannerRef.current = null;
        },
        (errorMessage) => {
          // Error callback - we can ignore most of these as they're just "no QR code found" messages
          if (errorMessage.includes('NotFoundException')) {
            return; // Ignore - just means no QR code in frame yet
          }
          console.warn('QR Scan error:', errorMessage);
        }
      );

      scannerRef.current = scanner;
    };

    // Start initialization with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initScanner, 50);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [open, onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <DialogTitle>Scan QR Code</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Position the QR code from the registration within the frame to automatically check in all children.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner Container */}
          <div 
            id="qr-reader" 
            className="rounded-lg overflow-hidden border border-border"
          />

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Tips for scanning:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Hold your device steady</li>
              <li>Ensure good lighting</li>
              <li>Keep the QR code within the highlighted area</li>
              <li>Allow camera access when prompted</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
