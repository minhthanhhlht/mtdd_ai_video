"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/Badge";
import { useT } from "@/lib/i18n";
import type { UserInfo } from "@/lib/api";

interface SidebarProfileProps {
  user: UserInfo;
  logout: () => void;
}

export function SidebarProfile({ user, logout }: SidebarProfileProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [popPos, setPopPos] = useState<{ bottom: number; left: number; width: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      setPopPos(null);
    } else {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const isCollapsed = rect.width < 100;
        const popoverWidth = 260;
        if (isCollapsed) {
          // Rail co 56px: mở popover sang bên phải của rail
          setPopPos({
            bottom: Math.max(8, window.innerHeight - rect.bottom),
            left: rect.right + 8,
            width: popoverWidth,
          });
        } else {
          // Rail mở 220px: mở popover ngay phía trên thẻ, bề rộng 260px đủ thoáng cho nhãn vai trò
          setPopPos({
            bottom: Math.max(8, window.innerHeight - rect.top + 8),
            left: rect.left,
            width: popoverWidth,
          });
        }
      }
      setOpen(true);
    }
  };

  // Đóng khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        cardRef.current &&
        !cardRef.current.contains(target) &&
        popRef.current &&
        !popRef.current.contains(target)
      ) {
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
    <>
      <div
        ref={cardRef}
        className="group flex items-center gap-2 rounded-[var(--radius)] px-2 py-1 transition-colors duration-150 hover:bg-[var(--surface)]"
        title={`${user.name} (${t(`users.role-${user.role}`)})`}
      >
        {/* Nút Avatar: bấm để mở popover menu chi tiết */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={user.name}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)] uppercase transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          {user.name.charAt(0) || <UserIcon size={14} />}
        </button>

        {/* Thông tin tên & vai trò: ẩn khi rail co 56px */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={user.name}
          className="shell-nav-label min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none"
        >
          <div className="truncate text-sm font-semibold text-[var(--text)] leading-tight">
            {user.name}
          </div>
          <div className="truncate text-xs text-[var(--text-muted)] capitalize leading-tight">
            {t(`users.role-${user.role}`)}
          </div>
        </button>

        {/* Nút đăng xuất trực tiếp: ẩn khi rail co 56px */}
        <button
          type="button"
          onClick={() => logout()}
          title={t("shell.logout")}
          aria-label={t("shell.logout")}
          className="shell-nav-label shrink-0 rounded-[var(--radius)] p-1 text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
        >
          <LogOut size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Popover menu dùng React Portal để không bao giờ bị cắt bởi overflow của sidebar */}
      {open &&
        popPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popRef}
            role="menu"
            aria-label={user.name}
            style={{
              bottom: popPos.bottom,
              left: popPos.left,
              width: popPos.width,
            }}
            className="fixed z-50 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg flex flex-col gap-2"
          >
            {/* Header thông tin người dùng */}
            <div className="flex items-center gap-2 p-2 rounded-[var(--radius)] bg-[var(--bg-subtle)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)] uppercase shrink-0">
                {user.name.charAt(0) || <UserIcon size={14} />}
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-[var(--text)] truncate" title={user.name}>
                  {user.name}
                </div>
                <div className="mt-1 flex items-center">
                  <Badge
                    tone={user.role === "admin" ? "success" : "muted"}
                    dot={false}
                    className="max-w-full"
                    label={<span className="truncate">{t(`users.role-${user.role}`)}</span>}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--border)]" role="separator" />

            {/* Nút đăng xuất */}
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
          </div>,
          document.body,
        )}
    </>
  );
}
