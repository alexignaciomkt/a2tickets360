import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRCodeScannerOptions {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  elementId: string;
}

export const useQRCodeScanner = ({ onScan, onError, elementId }: QRCodeScannerOptions) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      if (!elementId) return;

      setIsScanning(true);

      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          // Optional: Stop scanning after successful scan? 
          // Usually better to keep scanning or let the parent decide to stop.
          // But user requested "invalidate tickets upon successful validation", which implies a single scan action often followed by a pause or stop.
          // For now, let's stop scanning automatically to prevent multiple triggers, or debounce. 
          // The parent component calls processCheckIn. 
          // Let's NOT stop automatically here to allow continuous scanning if desired, unless parent calls stopScanning.
          // However, to prevent rapid fire of the same code, we might want to pause.
          // Let's rely on parent to handle debounce or stop.
          stopScanning(); // Let's stop after one successful scan for better UX in mobile validation scenarios.
        },
        (errorMessage) => {
          // ignore errors for each frame
        }
      );

    } catch (error) {
      setIsScanning(false);
      console.error("Error starting scanner:", error);
      onError?.('Erro ao iniciar a câmera. Verifique as permissões ou se está usando HTTPS.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
        setIsScanning(false);
      }
    }
  };

  return {
    isScanning,
    startScanning,
    stopScanning
  };
};
