"use client";

import { create } from "zustand";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    counter += 1;
    const id = counter;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3800);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
}));

/** 全局 Toast 快捷方法，供任意客户端组件调用。 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: "error", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: "info", title, description })
};

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <button
            className={`toast toast-${item.kind}`}
            key={item.id}
            onClick={() => dismiss(item.id)}
            type="button"
          >
            <Icon size={18} />
            <span className="toast-body">
              <strong>{item.title}</strong>
              {item.description ? <span className="toast-desc">{item.description}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
