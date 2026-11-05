"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useOAuthLogin, useLogout } from "@/services";
import { readRoleFromAccessToken } from "@/lib/access-token";
import { errorToast, successToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/error";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: string | number;
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
            }
          ) => void;
        };
      };
    };
  }
}

const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "757719972143-qlrsqr2arc872eaqtvm73m4uhmtb73oi.apps.googleusercontent.com";

const GIS_SRC = "https://accounts.google.com/gsi/client";

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`
    );
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Google script"))
        );
      }
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

export function GoogleLoginButton({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { mutate: oauthLogin, isPending: isLoggingIn } = useOAuthLogin();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const isPending = isLoggingIn || isLoggingOut;

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const submitRef = useRef<((response: { credential?: string }) => void) | null>(null);

  const handleCredential = useCallback(
    (response: { credential?: string }) => {
      const token = response?.credential;
      if (!token) {
        errorToast(t("googleSignInFailedToast"));
        return;
      }

      oauthLogin(
        { provider: "google", token, role: "user" },
        {
          onSuccess: (res) => {
            const userRole = readRoleFromAccessToken(res?.data?.accessToken);
            if (userRole && userRole !== "user") {
              logout(undefined, {
                onSettled: () => {
                  errorToast(t("adminNotAllowed"));
                },
              });
              return;
            }

            successToast(t("loginTitle"), "Welcome to BankyBondy!");
            router.replace("/");
          },
          onError: (err) => {
            errorToast(getErrorMessage(err, t("googleSignInFailedToast")));
          },
        }
      );
    },
    [oauthLogin, logout, router, t]
  );

  useEffect(() => {
    submitRef.current = handleCredential;
  }, [handleCredential]);

  useEffect(() => {
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => submitRef.current?.(res),
        });

        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";
          const isDark = resolvedTheme === "dark";
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "center",
          });
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          errorToast(t("googleSignInLoadFailedToast"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t, resolvedTheme]);

  return (
    <div className={className}>
      <div
        ref={buttonRef}
        className="flex w-full justify-center overflow-hidden rounded-md min-h-10"
        aria-busy={isPending}
      />
      {!ready && (
        <div className="flex h-10 w-full items-center justify-center rounded-md border border-border text-xs text-muted-foreground animate-pulse">
          {t("loading")}
        </div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
