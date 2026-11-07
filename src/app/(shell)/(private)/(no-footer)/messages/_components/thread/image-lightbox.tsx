"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ImageLightboxProps {
  images: string[];
  index: number | null;
  onClose: () => void;
  label: string;
}

export function ImageLightbox({
  images,
  index,
  onClose,
  label,
}: ImageLightboxProps) {
  const open = index !== null;
  const slides = images.map((src) => ({
    src,
    alt: label,
  }));

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index ?? 0}
      slides={slides}
      plugins={[Zoom]}
      animation={{ fade: 250, swipe: 250 }}
      carousel={{ finite: images.length <= 1 }}
      render={{
        buttonPrev: images.length <= 1 ? () => null : undefined,
        buttonNext: images.length <= 1 ? () => null : undefined,
      }}
    />
  );
}

