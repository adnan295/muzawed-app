import { Capacitor } from "@capacitor/core";

interface UpdateModalProps {
  playStoreUrl: string;
  currentVersion: string;
  minVersion: string;
}

export function UpdateModal({ playStoreUrl, currentVersion, minVersion }: UpdateModalProps) {
  const handleUpdate = () => {
    if (Capacitor.isNativePlatform()) {
      window.open(playStoreUrl, "_system");
    } else {
      window.open(playStoreUrl, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      data-testid="update-modal"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[1.5rem] bg-white/15 border border-white/25 flex items-center justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
              <path d="M28 8L44 18V38L28 48L12 38V18L28 8Z" fill="white" fillOpacity="0.9" />
              <path d="M28 8L44 18L28 28L12 18L28 8Z" fill="white" />
              <path d="M28 28V48L12 38V18L28 28Z" fill="white" fillOpacity="0.7" />
              <path d="M28 28V48L44 38V18L28 28Z" fill="white" fillOpacity="0.5" />
              <circle cx="28" cy="26" r="6" fill="#7c3aed" />
              <path d="M25 26L27 28L31 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">تحديث مطلوب</h2>
          <p className="text-purple-200 text-sm">يتوفر إصدار جديد من تطبيق <span className="font-bold text-white">Muzwd</span></p>
        </div>

        <div className="px-6 py-6 text-center space-y-4">
          <div className="bg-purple-50 rounded-2xl p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              نسخة التطبيق الحالية لديك{" "}
              <span className="font-bold text-purple-700 dir-ltr inline-block">{currentVersion}</span>{" "}
              قديمة. يرجى تحديث التطبيق إلى الإصدار{" "}
              <span className="font-bold text-purple-700 dir-ltr inline-block">{minVersion}</span>{" "}
              أو أحدث للاستمرار في الاستخدام.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>مميزات وتحسينات جديدة في هذا الإصدار</span>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-transform"
            data-testid="btn-update-now"
          >
            تحديث الآن
          </button>

          <p className="text-xs text-gray-400">
            يجب تحديث التطبيق للمتابعة
          </p>
        </div>
      </div>
    </div>
  );
}
