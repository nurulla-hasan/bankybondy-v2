"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Mail, RotateCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyCode, useResendVerifyCode } from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";

function VerifyCodeContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = React.useState("");
  const { mutate: verify, isPending: isVerifying } = useVerifyCode();
  const { mutate: resend, isPending: isResending } = useResendVerifyCode();

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      errorToast("Email address is missing. Please sign up again.");
      return;
    }
    if (code.length < 4) {
      errorToast("Please enter the verification code.");
      return;
    }

    verify(
      { email, verifyCode: code },
      {
        onSuccess: () => {
          successToast("Account Verified", "Your account has been verified successfully!");
          router.replace("/");
        },
        onError: (err) => {
          errorToast(getErrorMessage(err, "Verification failed. Invalid or expired code."));
        },
      },
    );
  };

  const handleResend = () => {
    if (!email) {
      errorToast("Email address is missing.");
      return;
    }

    resend(
      { email },
      {
        onSuccess: () => {
          successToast("Code Resent", "A new verification code has been sent to your email.");
        },
        onError: (err) => {
          errorToast(getErrorMessage(err, "Failed to resend code. Please try again."));
        },
      },
    );
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription className="max-w-xs mx-auto">
          We sent a verification code to{" "}
          <span className="font-semibold text-foreground break-all">
            {email || "your email"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            size="lg"
            loading={isVerifying}
            loadingText={t("loading")}
            disabled={code.length < 4}
          >
            <CheckCircle2 className="size-4 mr-2" />
            Verify & Continue
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 text-center text-xs border-t pt-4">
        <div className="flex items-center justify-center gap-1.5">
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RotateCw className={`size-3 ${isResending ? "animate-spin" : ""}`} />
            Resend
          </button>
        </div>

        <div>
          Wrong email address?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-semibold"
          >
            Sign up again
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyCodePage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading verification...
        </div>
      }
    >
      <VerifyCodeContent />
    </React.Suspense>
  );
}
