import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  maxWidth?: number;
  quality?: number;
}

export function ImageUploader({ value, onChange, className, maxWidth = 1920, quality = 80 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    setIsUploading(true);
    setPreview(URL.createObjectURL(file));
    setCompressionInfo(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxWidth', maxWidth.toString());
      formData.append('quality', quality.toString());

      const uploadRes = await fetch("/api/objects/upload-compressed", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "فشل في رفع الصورة");
      }

      const { objectPath, originalSize, compressedSize, compressionRatio } = await uploadRes.json();

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      setCompressionInfo(`تم ضغط الصورة: ${formatSize(originalSize)} → ${formatSize(compressedSize)} (${compressionRatio})`);
      toast.success(`تم ضغط الصورة بنسبة ${compressionRatio}`);

      onChange(objectPath);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "فشل في رفع الصورة");
      setPreview(value || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    setCompressionInfo(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getImageSrc = (src: string) => {
    if (src.startsWith("/objects/")) {
      return src;
    }
    if (src.startsWith("http")) {
      return src;
    }
    return src;
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-image-upload"
      />
      
      {preview || value ? (
        <div className="space-y-2">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
            <img
              src={getImageSrc(preview || value || "")}
              alt="صورة"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6"
                onClick={handleRemove}
                data-testid="button-remove-image"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {compressionInfo && (
            <div className="flex items-center gap-1 text-xs text-green-600 max-w-32">
              <Check className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{compressionInfo}</span>
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-32 h-32 flex flex-col gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          data-testid="button-upload-image"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs">رفع صورة</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
