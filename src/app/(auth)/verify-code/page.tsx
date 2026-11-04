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
import {
  useVerifyCode,
  useResendVerifyCode,
  useVerifyResetOtp,
  useResendResetCode,
} from "@/services";
import { successToast, errorToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";

function VerifyCodeContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signup";
  const isResetMode = type === "reset-password";

  const [code, setCode] = React.useState("");
  const { mutate: verifySignup, isPending: isVerifyingSignup } = useVerifyCode();
  const { mutate: resendSignup, isPending: isResendingSignup } = useResendVerifyCode();

  const { mutate: verifyReset, isPending: isVerifyingReset } = useVerifyResetOtp();
  const { mutate: resendReset, isPending: isResendingReset } = useResendResetCode();

  const isVerifying = isVerifyingSignup || isVerifyingReset;
  const isResending = isResendingSignup || isResendingReset;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      errorToast("Email address is missing. Please start again.");
      return;
    }
    if (code.length < 4) {
      errorToast("Please enter the verification code.");
      return;
    }
    if (!/^\d+$/.test(code)) {
      errorToast("The verification code must contain digits only.");
      return;
    }

    const numericCode = Number(code);

    if (isResetMode) {
      verifyReset(
        { email, resetCode: numericCode },
        {
          onSuccess: () => {
            successToast(
              t("codeVerifiedToast", { defaultMessage: "Code Verified" }),
              "Code verified! Now set your new password."
            );
            router.push(
              `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
            );
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Verification failed. Invalid or expired code."));
          },
        }
      );
    } else {
      verifySignup(
        { email, verifyCode: numericCode },
        {
          onSuccess: () => {
            successToast("Account Verified", "Your account has been verified successfully!");
            router.replace("/");
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Verification failed. Invalid or expired code."));
          },
        }
      );
    }
  };

  const handleResend = () => {
    if (!email) {
      errorToast("Email address is missing.");
      return;
    }

    if (isResetMode) {
      resendReset(
        { email },
        {
          onSuccess: () => {
            successToast("Code Resent", "A new reset code has been sent to your email.");
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Failed to resend code. Please try again."));
          },
        }
      );
    } else {
      resendSignup(
        { email },
        {
          onSuccess: () => {
            successToast("Code Resent", "A new verification code has been sent to your email.");
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, "Failed to resend code. Please try again."));
          },
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isResetMode ? t("verifyResetCodeTitle") : "Verify your email"}
        </CardTitle>
        <CardDescription className="max-w-xs mx-auto">
          {isResetMode
            ? t("verifyResetCodeSubtitle")
            : "We sent a verification code to "}{" "}
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
            className="w-full"
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

      <CardFooter className="flex flex-col gap-3 text-center text-xs">
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
