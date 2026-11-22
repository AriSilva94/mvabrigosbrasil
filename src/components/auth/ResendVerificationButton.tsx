"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { RESEND_VERIFICATION_COOLDOWN_SECONDS } from "@/lib/auth/emailVerification";

type ResendVerificationButtonProps = {
  email: string;
};

export default function ResendVerificationButton({
  email,
}: ResendVerificationButtonProps): JSX.Element {
  const [isSending, setIsSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleClick() {
    if (isSending || secondsLeft > 0) return;

    setIsSending(true);
    try {
      await apiClient("/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success("Se o e-mail estiver cadastrado, enviaremos um novo link.");
      setSecondsLeft(RESEND_VERIFICATION_COOLDOWN_SECONDS);
    } catch {
      toast.error("Não foi possível reenviar o e-mail. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isSending || secondsLeft > 0}
    >
      {isSending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Enviando...
        </>
      ) : secondsLeft > 0 ? (
        `Reenviar em ${secondsLeft}s`
      ) : (
        "Reenviar e-mail de confirmação"
      )}
    </Button>
  );
}
