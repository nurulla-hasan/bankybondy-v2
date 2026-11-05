"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  label?: string;
  variant?: "link" | "outline" | "ghost" | "default" | "destructive" | "secondary";
}

export default function BackButton({ 
  className, 
  label = "Back", 
  variant = "link" 
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size="default"
      className={className}
      onClick={() => router.back()}
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}
