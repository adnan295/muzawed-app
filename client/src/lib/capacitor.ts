import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initCapacitor() {
  if (!isNative) return;

  try {
    await SplashScreen.hide();
  } catch {}

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#7c3aed' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {}

  try {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {}
}

export function setupBackButton(onBackPress: () => void) {
  if (!isNative) return () => {};

  const listener = App.addListener('backButton', ({ canGoBack }) => {
    onBackPress();
  });

  return () => {
    listener.then(l => l.remove());
  };
}
