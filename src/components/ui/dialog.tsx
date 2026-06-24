"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  /** 说明即将发生什么、是否可撤销、对项目状态的影响、下一步由谁处理。 */
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

interface DialogState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  close: (result: boolean) => void;
}

const useDialogStore = create<DialogState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    }),
  close: (result) => {
    const resolve = get().resolve;
    resolve?.(result);
    set({ open: false, options: null, resolve: null });
  }
}));

/** 替代 confirm() 的全局确认弹窗，返回用户选择。 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return useDialogStore.getState().confirm(options);
}

export function DialogHost() {
  const open = useDialogStore((state) => state.open);
  const options = useDialogStore((state) => state.options);
  const close = useDialogStore((state) => state.close);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !options) return null;
  const isDanger = options.tone === "danger";

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={options.title}>
      <div className="dialog">
        <div className={`dialog-icon ${isDanger ? "dialog-icon-danger" : ""}`}>
          {isDanger ? <AlertTriangle size={20} /> : null}
        </div>
        <h2 className="dialog-title">{options.title}</h2>
        {options.description ? <p className="dialog-desc">{options.description}</p> : null}
        {options.details && options.details.length > 0 ? (
          <ul className="dialog-details">
            {options.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <div className="dialog-actions">
          <button
            className="button button-secondary"
            onClick={() => close(false)}
            type="button"
          >
            {options.cancelLabel ?? "取消"}
          </button>
          <button
            className={`button ${isDanger ? "button-danger" : "button-primary"}`}
            onClick={() => close(true)}
            type="button"
          >
            {options.confirmLabel ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}
