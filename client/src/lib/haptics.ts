import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = () => {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
};

export const haptic = {
  light: async () => {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  },

  medium: async () => {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  },

  heavy: async () => {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  },

  success: async () => {
    if (!isNative()) return;
    await Haptics.notification({ type: NotificationType.Success });
  },

  warning: async () => {
    if (!isNative()) return;
    await Haptics.notification({ type: NotificationType.Warning });
  },

  error: async () => {
    if (!isNative()) return;
    await Haptics.notification({ type: NotificationType.Error });
  },

  selection: async () => {
    if (!isNative()) return;
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  },
};
