import type { Request, Response } from "express";
import { EventEmitter } from "node:events";

/** EventEmitter nội bộ cho các tiến trình server (ví dụ: chờ job hoàn thành) */
export const jobEvents = new EventEmitter();
jobEvents.setMaxListeners(100);

/**
 * SSE hub - một stream chung tại GET /api/events.
 * Event types: "job" (Job), "joblog" ({jobId, line}), "agent" ({sessionId, kind, ...}).
 */
const clients = new Set<Response>();

/**
 * Trần số client SSE đồng thời - mỗi client là một socket giữ mãi; không giới
 * hạn thì một vòng lặp mở stream sẽ nuốt hết file descriptor của server.
 * Dashboard thật chỉ dùng 1 stream mỗi tab.
 */
const MAX_SSE_CLIENTS = 50;

export function addSseClient(req: Request, res: Response): void {
  // Dọn client đã chết trước khi tính trần (tab đóng đột ngột)
  for (const c of clients) {
    if (c.writableEnded || c.destroyed) clients.delete(c);
  }
  if (clients.size >= MAX_SSE_CLIENTS) {
    res.status(503).json({
      error: { code: "TOO_MANY_STREAMS", message: "Quá nhiều kết nối realtime" },
    });
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(": connected\n\n");
  clients.add(res);
  req.on("close", () => {
    clients.delete(res);
  });
  // Socket lỗi (client rớt mạng đột ngột) - gỡ client để không thành zombie
  res.on("error", () => {
    clients.delete(res);
  });
}

export function broadcast(event: string, data: unknown): void {
  // Bắn sự kiện nội bộ cho các request đang chờ job (long-polling)
  if (event === "job" && data && typeof data === "object") {
    const job = data as { id?: string; status?: string };
    if (job.id) {
      jobEvents.emit(`job:${job.id}`, job);
      jobEvents.emit("job", job);
    }
  }

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    if (res.writableEnded || res.destroyed) {
      clients.delete(res);
      continue;
    }
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

// Heartbeat comment mỗi 15s giữ kết nối sống qua proxy
const heartbeat = setInterval(() => {
  for (const res of clients) {
    if (res.writableEnded || res.destroyed) {
      clients.delete(res);
      continue;
    }
    try {
      res.write(": ping\n\n");
    } catch {
      clients.delete(res);
    }
  }
}, 15_000);
heartbeat.unref();
