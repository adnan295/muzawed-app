import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // Get presigned upload URL
      const uploadRes = await fetch("/api/objects/upload", { method: "POST" });
      if (!uploadRes.ok) throw new Error("فشل في الحصول على رابط الرفع");
      const { uploadURL } = await uploadRes.json();

      // Upload file directly to storage
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (!putRes.ok) throw new Error("فشل في رفع الملف");

      // Confirm upload and get object path
      const confirmRes = await fetch("/api/objects/confirm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadURL }),
      });
      if (!confirmRes.ok) throw new Error("فشل في تأكيد الرفع");
      const { objectPath } = await confirmRes.json();

      onChange(objectPath);
    } catch (error) {
      console.error("Upload error:", error);
      setPreview(value || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
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
