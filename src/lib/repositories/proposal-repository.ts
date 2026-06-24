import type { ProposalDraft } from "@/types/domain";

const STORAGE_KEY = "assurance-demo-proposals";

interface StoredProposal extends ProposalDraft {
  proposalCode: string;
  submittedAt: string;
}

function readAll(): StoredProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProposal[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: StoredProposal[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 忽略隐私模式或存储不可用。
  }
}

function makeCode(existing: number): string {
  const sequence = String(existing + 1).padStart(3, "0");
  return `PROP-DEMO-${sequence}`;
}

/** 演示用：将供应商方案写入本地存储（无真实后端）。 */
export function submitDemoProposal(draft: ProposalDraft): StoredProposal {
  const list = readAll();
  const stored: StoredProposal = {
    ...draft,
    proposalCode: makeCode(list.length),
    submittedAt: new Date().toISOString()
  };
  writeAll([...list, stored]);
  return stored;
}

export function listDemoProposals(projectId?: string): StoredProposal[] {
  const list = readAll();
  return projectId ? list.filter((item) => item.projectId === projectId) : list;
}
