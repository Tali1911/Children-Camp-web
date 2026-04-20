import { useEffect, useRef } from 'react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { GOOGLE_CLIENT_ID } from '@/config/googleAuth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapProps {
  onDismiss?: () => void;
}

const GoogleOneTap = ({ onDismiss }: GoogleOneTapProps) => {
  const { isSignedIn, signInWithIdToken } = useClientAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (isSignedIn || initialized.current) return;
    
    // Don't show if already dismissed this session
    const dismissed = sessionStorage.getItem('google_one_tap_dismissed');
    if (dismissed) return;

    // Don't show if client ID isn't configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) return;

    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initOneTap = async () => {
      await loadScript();
      
      if (!window.google?.accounts?.id) return;
      
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            await signInWithIdToken(response.credential);
          } catch (error) {
            console.error('One Tap sign-in error:', error);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap couldn't display or was skipped
          sessionStorage.setItem('google_one_tap_dismissed', 'true');
          onDismiss?.();
        }
        if (notification.isDismissedMoment()) {
          sessionStorage.setItem('google_one_tap_dismissed', 'true');
          onDismiss?.();
        }
      });
    };

    // Small delay to let the page settle
    const timer = setTimeout(initOneTap, 1500);
    return () => clearTimeout(timer);
  }, [isSignedIn, signInWithIdToken, onDismiss]);

  return null; // Google renders its own UI
};

export default GoogleOneTap;
