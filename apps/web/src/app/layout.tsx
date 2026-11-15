import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { FAVICON } from "@/lib/brand";
import { Shell } from "@/components/Shell";
import { StaleChunkGuard } from "@/components/StaleChunkGuard";
import { LanguageProvider } from "@/lib/i18n";
import { EventsProvider } from "@/lib/useEvents";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "AI Edit Video - MTDD AI",
  description: "Edit video tự động bằng AI",
  icons: {
    icon: [
      { url: FAVICON, type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/brand/mtdd-ai-icon-blue-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

/**
 * Chống kẹt màn hình khi server deploy/build bản mới làm lệch mã băm chunk Next.js.
 * Bắt lỗi resource script/link _next/static NGAY Ở ĐẦU TRANG trước khi React boot,
 * tự động reload một lần để tải bundle mới nhất.
 */
const CHUNK_GUARD_SCRIPT = `try{window.addEventListener("error",function(e){var t=e.target;if(t&&(t.tagName==="SCRIPT"||t.tagName==="LINK")){var u=t.src||t.href||"";if(u.indexOf("/_next/static/")!==-1){var k="aiev_chunk_reload",last=Number(sessionStorage.getItem(k)||0);if(Date.now()-last>8000){sessionStorage.setItem(k,String(Date.now()));location.reload();}}}},true);window.addEventListener("unhandledrejection",function(e){var r=e.reason,m=(r&&r.message)||"";if(/loading chunk|chunkloaderror|failed to fetch dynamically imported|_next\\/static/i.test(m)){var k="aiev_chunk_reload",last=Number(sessionStorage.getItem(k)||0);if(Date.now()-last>8000){sessionStorage.setItem(k,String(Date.now()));location.reload();}}});}catch(e){}`;

/** Chống FOUC: áp data-theme trước khi paint. Mặc định light. */
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

/**
 * Link tunnel `?t=<token>`: cất token vào localStorage (khóa TOKEN_KEY của
 * lib/api.ts) rồi gỡ khỏi thanh địa chỉ NGAY trước khi paint - đợi tới lúc
 * ensureToken() chạy thì URL có token đã nằm trên màn hình và trong lịch sử.
 * Ghi localStorage hỏng thì để nguyên ?t= cho ensureToken() tự xử lý.
 */
const TOKEN_URL_SCRIPT = `try{var u=new URL(location.href),t=u.searchParams.get("t");if(t&&!u.searchParams.get("k")){localStorage.setItem("aiev_api_token",t);u.searchParams.delete("t");history.replaceState(history.state,"",u.pathname+u.search+u.hash)}}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: CHUNK_GUARD_SCRIPT + TOKEN_URL_SCRIPT + THEME_SCRIPT }} />
        <StaleChunkGuard />
        <LanguageProvider>
          <AuthProvider>
            <EventsProvider>
              <Shell>{children}</Shell>
            </EventsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
