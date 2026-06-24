import type { ProjectStatus, PublishDraft, PublishResult } from "@/types/domain";

const STORAGE_KEY = "assurance-demo-published-projects";

interface StoredPublish extends PublishDraft {
  projectCode: string;
  status: ProjectStatus;
  submittedAt: string;
}

function readAll(): StoredPublish[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPublish[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: StoredPublish[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 忽略隐私模式或存储不可用。
  }
}

function makeCode(existing: number): string {
  const sequence = String(existing + 1).padStart(3, "0");
  return `PROJ-DEMO-${sequence}`;
}

/**
 * 演示用：将发布的项目写入本地存储。
 * 不接入真实后端与支付；状态进入"平台审核中"。
 */
export function submitDemoPublish(draft: PublishDraft): PublishResult {
  const list = readAll();
  const code = makeCode(list.length);
  writeAll([
    ...list,
    { ...draft, projectCode: code, status: "reviewing", submittedAt: new Date().toISOString() }
  ]);
  return {
    projectCode: code,
    title: draft.title,
    assuranceTier: draft.assuranceTier,
    status: "reviewing",
    submittedAt: new Date().toISOString()
  };
}

export function listDemoPublishes(): StoredPublish[] {
  return readAll();
}
