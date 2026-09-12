import { api } from './client';

export type AgentMessage = {
  id: string;
  role: string;
  body: string;
  toolName?: string | null;
  createdAt: string;
};

export type AgentTurnResult = {
  reply: string;
  intent: string;
  toolsRun: Array<{ name: string; ok: boolean; summary?: string; error?: string; data?: unknown }>;
  suggestAttachTx: boolean;
  suggestEscalate: boolean;
  suggestReconcile?: boolean;
  status?: string;
  escalatedCaseId?: string | null;
  attachedTxLabel?: string | null;
  mode?: 'llm' | 'rules';
};

export function createAgentSession() {
  return api.post<{ id: string; status: string; llmEnabled?: boolean }>('/support/agent/sessions');
}

export function getAgentSession(id: string) {
  return api.get<{
    id: string;
    status: string;
    attachedTxId?: string | null;
    attachedTxLabel?: string | null;
    escalatedCaseId?: string | null;
    messages: AgentMessage[];
  }>(`/support/agent/sessions/${id}`);
}

export function sendAgentMessage(sessionId: string, message: string, forceEscalate?: boolean) {
  return api.post<AgentTurnResult>(`/support/agent/sessions/${sessionId}/messages`, {
    message,
    forceEscalate,
  });
}

export function attachAgentTransaction(
  sessionId: string,
  body: { transactionId: string; type?: string; label?: string },
) {
  return api.post<{
    attachedTxId?: string;
    attachedTxLabel?: string;
    attachedTxType?: string;
  }>(`/support/agent/sessions/${sessionId}/attach-transaction`, body);
}

export function reconcileDeposit(sessionId: string, depositRequestId: string) {
  return api.post<{ ok?: boolean; summary?: string; error?: string }>(
    `/support/agent/sessions/${sessionId}/reconcile`,
    { depositRequestId },
    { idempotent: true },
  );
}

export type PendingConfirmTool = {
  pendingTool: string;
  args?: Record<string, unknown>;
  confirmHint?: string;
};

/** Confirm a yellow-tier AI tool that returned needs_confirmation. */
export function confirmAgentTool(
  sessionId: string,
  body: { toolName: string; args?: Record<string, unknown> },
) {
  return api.post<{
    ok: boolean;
    summary?: string;
    error?: string;
    data?: unknown;
  }>(`/support/agent/sessions/${sessionId}/confirm-tool`, body, { idempotent: true });
}

/** SSE stream helper — falls back to non-stream send on failure. */
export async function streamAgentMessage(
  sessionId: string,
  message: string,
  handlers: {
    onPartial?: (text: string) => void;
    onDone?: (result: AgentTurnResult) => void;
    onError?: (msg: string) => void;
  },
): Promise<void> {
  const base =
    (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_BASE_URL ||
    'http://localhost:4000';
  let token = '';
  try {
    const raw = localStorage.getItem('convia.session');
    if (raw) token = (JSON.parse(raw) as { accessToken?: string }).accessToken || '';
  } catch {
    /* ignore */
  }

  try {
    const url = `${base}/support/agent/sessions/${sessionId}/stream?message=${encodeURIComponent(message)}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok || !res.body) throw new Error('stream_unavailable');
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const block of parts) {
        const lines = block.split('\n');
        let event = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as AgentTurnResult & { text?: string; message?: string };
          if (event === 'partial' && parsed.text) handlers.onPartial?.(parsed.text);
          if (event === 'done') handlers.onDone?.(parsed as AgentTurnResult);
          if (event === 'error') handlers.onError?.(parsed.message || 'error');
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    // Fallback
    const result = await sendAgentMessage(sessionId, message);
    handlers.onDone?.(result);
  }
}


export type AgentTxItem = {
  id: string;
  publicRef: string;
  type: string;
  amount: string;
  asset: string;
  status: string;
  createdAt: string;
  label: string;
};

export function listAgentTransactions(sessionId: string, type?: string) {
  const q = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
  return api.get<{ items: AgentTxItem[]; depositRequests?: AgentTxItem[]; attachedTxId?: string | null }>(
    `/support/agent/sessions/${sessionId}/transactions${q}`,
  );
}

export function detachAgentTransaction(sessionId: string) {
  return api.delete<{ ok: boolean }>(`/support/agent/sessions/${sessionId}/attach-transaction`);
}
