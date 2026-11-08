"use client";

import { ChevronDown, ExternalLink, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/Badge";
import { UpdateBadge } from "@/components/UpdateBadge";
import { useT } from "@/lib/i18n";
import type { UserInfo } from "@/lib/api";

const REPO_URL = "https://github.com/notivn/AIEVv2";

function GithubMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

interface UserProfileMenuProps {
  user: UserInfo;
  logout: () => void;
}

export function UserProfileMenu({ user, logout }: UserProfileMenuProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Đóng khi click ngoài menu
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (menuRef.current && !menuRef.current.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative pl-2 border-l border-[var(--border)]">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={user.name}
        className="flex items-center gap-2 rounded-[var(--radius)] px-2 py-1 transition-colors duration-150 hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)] uppercase shrink-0">
          {user.name.charAt(0) || <UserIcon size={14} />}
        </span>
        <div className="hidden sm:flex flex-col items-start leading-none gap-1 text-left">
          <span className="text-sm font-semibold max-w-[120px] truncate text-[var(--text)]" title={user.name}>
            {user.name}
          </span>
          <span className="text-xs text-[var(--text-muted)] capitalize">
            {t(`users.role-${user.role}`)}
          </span>
        </div>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="text-[var(--text-muted)] transition-transform duration-150 shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={user.name}
          className="absolute right-0 top-full mt-2 w-64 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg z-50 flex flex-col gap-2"
        >
          {/* Header thông tin người dùng */}
          <div className="flex items-center gap-3 p-2 rounded-[var(--radius)] bg-[var(--bg-subtle)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)] uppercase shrink-0">
              {user.name.charAt(0) || <UserIcon size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--text)] truncate" title={user.name}>
                {user.name}
              </div>
              <div className="mt-0.5">
                <Badge
                  tone={user.role === "admin" ? "success" : "muted"}
                  dot={false}
                  label={t(`users.role-${user.role}`)}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" role="separator" />

          {/* Badge cập nhật phiên bản hệ thống */}
          <div className="flex flex-col">
            <UpdateBadge />
          </div>

          {/* Link Mã nguồn GitHub */}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            title={REPO_URL}
            aria-label={t("nav.source")}
            role="menuitem"
            className="flex items-center gap-2 rounded-[var(--radius)] p-2 text-sm text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
          >
            <GithubMark size={14} />
            <span className="min-w-0 flex-1 truncate">{t("nav.source")}</span>
            <ExternalLink
              size={12}
              strokeWidth={2}
              className="shrink-0 opacity-60"
              aria-hidden="true"
            />
          </a>

          <div className="h-px bg-[var(--border)]" role="separator" />

          {/* Đăng xuất */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 rounded-[var(--radius)] p-2 text-left text-sm text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--danger-bg)]"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>{t("shell.logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
