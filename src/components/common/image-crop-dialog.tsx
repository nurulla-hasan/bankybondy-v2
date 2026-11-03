"use client";

import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { getCompressedCroppedAvatar } from "@/lib/cropImage";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChangeHandler = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChangeHandler = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  const handleCropAndSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCompressedCroppedAvatar(
        imageSrc,
        croppedAreaPixels,
        {
          fileName: `avatar_${Date.now()}.jpg`,
          outputSize: 512,
          mimeType: "image/jpeg",
          quality: 0.85,
          maxBytes: 500 * 1024,
        },
      );
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
      onClose();
    } catch (error) {
      console.error("Image crop failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Crop & Adjust Profile Picture"
      description="Drag and zoom to frame your photo inside the circular area."
    >
      <div className="space-y-4">
        {/* Cropper Container */}
        <div className="relative mx-auto h-72 w-full overflow-hidden rounded-xl bg-black/90 shadow-inner">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChangeHandler}
            onZoomChange={onZoomChangeHandler}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        {/* Zoom Slider Control */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            aria-label="Zoom Out"
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ZoomOut className="size-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary h-1.5 bg-muted rounded-lg"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            aria-label="Zoom In"
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ZoomIn className="size-4" />
          </button>
          <span className="min-w-[4ch] text-right font-mono text-xs tabular-nums text-muted-foreground">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCropAndSave}
            loading={isProcessing}
            loadingText="Processing..."
          >
            <Check />
            Crop & Save
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
