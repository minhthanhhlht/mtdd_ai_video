"use client";

import { Eye, EyeOff, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Banner } from "@/components/Banner";
import { Field } from "@/components/Field";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/authContext";
import { useT } from "@/lib/i18n";

function LoginForm() {
  const { t } = useT();
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Nếu đã đăng nhập, tự động chuyển về trang chủ hoặc trang yêu cầu trước đó
  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    }
  }, [user, router, redirectPath]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password, rememberMe);
      router.replace(redirectPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("login.error-generic");
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--bg)]">
      {/* Nút đổi ngôn ngữ & theme ở góc trên phải */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="card w-full max-w-md p-6 flex flex-col gap-4">
        {/* Header với logo và tiêu đề */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <LogIn size={24} aria-hidden="true" />
          </div>
          <h1 className="text-sm font-semibold tracking-wide">
            {t("login.title")}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            {t("login.subtitle")}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <Banner tone="danger" message={errorMsg} />
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label={t("login.username")}
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <User size={16} aria-hidden="true" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.username-placeholder")}
                className="input w-full pl-9"
                required
                autoComplete="username"
                autoFocus
              />
            </div>
          </Field>

          <Field
            label={t("login.password")}
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <Lock size={16} aria-hidden="true" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input w-full pl-9 pr-9"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                aria-label={showPassword ? t("login.hide-password") : t("login.show-password")}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Ghi nhớ đăng nhập */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[var(--primary)] w-4 h-4 rounded-[var(--radius)]"
            />
            <span className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
              {t("login.remember-me")}
            </span>
          </label>

          {/* Nút gửi */}
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !username.trim() || !password}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn size={16} aria-hidden="true" />
            <span>{submitting ? t("login.submitting") : t("login.submit")}</span>
          </Button>
        </form>

        {/* Hướng dẫn tài khoản mặc định cho lần đầu đăng nhập */}
        <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-2">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <ShieldCheck size={14} className="text-[var(--primary)] shrink-0" aria-hidden="true" />
            <span className="font-semibold">{t("login.default-accounts-title")}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] p-2 rounded-[var(--radius)]">
            <div>
              <span className="font-semibold text-[var(--text)]">admin</span>
              <div className="text-[var(--text-muted)]">Admin</div>
            </div>
            <div>
              <span className="font-semibold text-[var(--text)]">editor</span>
              <div className="text-[var(--text-muted)]">Editor</div>
            </div>
            <div>
              <span className="font-semibold text-[var(--text)]">viewer</span>
              <div className="text-[var(--text-muted)]">Viewer</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-4 bg-[var(--bg)]" />}>
      <LoginForm />
    </Suspense>
  );
}
