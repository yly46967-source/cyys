"use client";

import { DialogHost } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toast";

/** 全局反馈层：Toast 与确认弹窗。在根布局中挂载一次。 */
export function FeedbackHost() {
  return (
    <>
      <DialogHost />
      <Toaster />
    </>
  );
}
