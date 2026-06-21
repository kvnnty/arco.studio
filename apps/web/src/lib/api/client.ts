import type { ArcoProject } from "@arco/project-schema";

export function getApiUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api"
  );
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = {
  token?: string;
  method?: string;
  body?: unknown;
  formData?: FormData;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, method = "GET", body, formData } = options;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (Array.isArray(payload.message)) {
        message = payload.message.join(", ");
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type AuthResponse = AuthTokensResponse;

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    onboardingStep: string;
  };
};

export async function apiRequestMagicLink(email: string) {
  return apiFetch<{ sent: boolean; devVerifyUrl?: string }>("/auth/magic-link", {
    method: "POST",
    body: { email: email.trim().toLowerCase() },
  });
}

export async function apiVerifyMagicLink(token: string): Promise<AuthTokensResponse> {
  return apiFetch<AuthTokensResponse>("/auth/magic-link/verify", {
    method: "POST",
    body: { token },
  });
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<AuthTokensResponse> {
  return apiFetch<AuthTokensResponse>("/auth/login", {
    method: "POST",
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  });
}

export async function apiRegister(input: {
  email: string;
  password: string;
}): Promise<{ sent: boolean; message: string; devVerifyUrl?: string }> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  });
}

export type ApiProjectRecord = {
  id: string;
  userId: string;
  title: string;
  platform: string;
  stylePreset: string | null;
  exportFormat: string;
  projectData: string;
  recordingSrc: string | null;
  markerCount: number;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  renderJobs?: Array<{
    id: string;
    status: string;
    outputUrl: string | null;
    format: string;
    errorMessage?: string | null;
  }>;
};

export function parseProjectData(raw: string | ArcoProject): ArcoProject {
  if (typeof raw !== "string") return raw;
  if (!raw || raw === "{}") {
    throw new Error("Project data is empty");
  }
  return JSON.parse(raw) as ArcoProject;
}

export async function apiGetProject(
  token: string,
  projectId: string,
): Promise<ApiProjectRecord> {
  return apiFetch<ApiProjectRecord>(`/projects/${projectId}`, { token });
}

export async function apiListProjects(
  token: string,
): Promise<ApiProjectRecord[]> {
  return apiFetch<ApiProjectRecord[]>("/projects", { token });
}

export async function apiCreateProject(
  token: string,
  input: {
    title: string;
    platform: string;
    exportFormat?: string;
    projectData?: ArcoProject;
  },
): Promise<ApiProjectRecord> {
  return apiFetch<ApiProjectRecord>("/projects", {
    token,
    method: "POST",
    body: input,
  });
}

export async function apiUpdateProject(
  token: string,
  projectId: string,
  input: {
    title?: string;
    platform?: string;
    stylePreset?: string;
    exportFormat?: string;
    projectData?: ArcoProject;
    recordingSrc?: string;
    markerCount?: number;
    thumbnailUrl?: string;
  },
): Promise<ApiProjectRecord> {
  return apiFetch<ApiProjectRecord>(`/projects/${projectId}`, {
    token,
    method: "PATCH",
    body: input,
  });
}

export async function uploadRecordingWithProgress(
  token: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ key: string; url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getApiUrl()}/uploads`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as { key: string; url: string });
        } catch {
          reject(new Error("Invalid upload response"));
        }
        return;
      }

      let message = "Upload failed";
      try {
        const payload = JSON.parse(xhr.responseText) as { message?: string };
        if (payload.message) message = payload.message;
      } catch {
        // ignore
      }
      reject(new ApiError(xhr.status, message));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export async function uploadThumbnail(
  token: string,
  file: File,
): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ key: string; url: string }>("/uploads/thumbnail", {
    token,
    method: "POST",
    formData,
  });
}

export type RenderJobRecord = {
  id: string;
  projectId: string;
  status: string;
  format: string;
  outputUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerateDraftResponse = {
  markers: import("@arco/project-schema").Marker[];
  stylePreset: import("@arco/project-schema").StylePreset;
  source: "llm" | "heuristic";
};

export async function apiCreateRender(
  token: string,
  input: { projectId: string; format: string },
): Promise<RenderJobRecord> {
  return apiFetch<RenderJobRecord>("/renders", {
    token,
    method: "POST",
    body: input,
  });
}

export async function apiGetRender(
  token: string,
  jobId: string,
): Promise<RenderJobRecord> {
  return apiFetch<RenderJobRecord>(`/renders/${jobId}`, { token });
}

export async function apiGenerateDraft(
  token: string,
  input: {
    title: string;
    durationMs: number;
    platform?: string;
    intent?: string;
    productUrl?: string;
    brandContext?: {
      title?: string;
      description?: string;
      tone?: string;
      colors?: { primary: string; background: string };
    };
  },
): Promise<GenerateDraftResponse> {
  return apiFetch<GenerateDraftResponse>("/ai/generate-draft", {
    token,
    method: "POST",
    body: input,
  });
}

export type RegenerateMarkerResponse = {
  callout: { text: string; subtext?: string };
  label?: string;
  source: "llm" | "heuristic";
};

export async function apiRegenerateMarker(
  token: string,
  input: {
    title: string;
    durationMs: number;
    markerIndex: number;
    markerCount: number;
    intent?: string;
    productUrl?: string;
    marker: {
      label?: string;
      callout?: { text: string; subtext?: string };
      startMs: number;
    };
  },
): Promise<RegenerateMarkerResponse> {
  return apiFetch<RegenerateMarkerResponse>("/ai/regenerate-marker", {
    token,
    method: "POST",
    body: input,
  });
}

export type RefineProjectResponse = {
  markers: Array<{ callout: { text: string; subtext?: string }; label?: string }>;
  source: "llm" | "heuristic";
};

export async function apiRefineProject(
  token: string,
  input: {
    title: string;
    instruction: string;
    intent?: string;
    productUrl?: string;
    markers: Array<{
      label?: string;
      callout?: { text: string; subtext?: string };
      startMs: number;
    }>;
  },
): Promise<RefineProjectResponse> {
  return apiFetch<RefineProjectResponse>("/ai/refine-project", {
    token,
    method: "POST",
    body: input,
  });
}

export type ChatResponse = {
  action: Record<string, unknown>;
  message: string;
  source: "llm" | "heuristic";
};

export async function apiChat(
  token: string,
  input: {
    projectId: string;
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    project: {
      title: string;
      stylePreset?: string;
      durationMs: number;
      intent?: string;
      productUrl?: string;
      markers: Array<{
        id: string;
        startMs: number;
        durationMs: number;
        label?: string;
        callout?: { text: string; subtext?: string };
      }>;
      selectedMarkerIndex?: number;
      playheadMs?: number;
    };
  },
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/ai/chat", {
    token,
    method: "POST",
    body: input,
  });
}

export type BrandKitResponse = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
  logoUrl?: string;
  colors: { primary: string; background: string };
  tone?: "technical" | "consumer" | "enterprise";
  source: "scrape" | "fallback";
};

export async function apiAnalyzeBrandUrl(
  token: string,
  url: string,
): Promise<BrandKitResponse> {
  return apiFetch<BrandKitResponse>("/brand/analyze-url", {
    token,
    method: "POST",
    body: { url },
  });
}

export type BillingStatus = {
  planStatus: string;
  plan: string | null;
  exportAllowance: number;
  exportsUsedThisPeriod: number;
  exportsRemaining: number;
  periodEnd: string | null;
  hadLaunchOffer: boolean;
  canUseProduct: boolean;
};

export type BillingUsage = {
  events: Array<{
    id: string;
    type: string;
    metadata: string;
    createdAt: string;
  }>;
  counts: Record<string, number>;
};

export async function apiGetBillingStatus(token: string): Promise<BillingStatus> {
  return apiFetch<BillingStatus>("/billing/status", { token });
}

export async function apiGetBillingUsage(token: string): Promise<BillingUsage> {
  return apiFetch<BillingUsage>("/billing/usage", { token });
}

export async function apiCreateBillingCheckout(
  token: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/billing/checkout-session", {
    token,
    method: "POST",
    body: {},
  });
}

export async function apiCreateBillingPortal(
  token: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/billing/portal-session", {
    token,
    method: "POST",
    body: {},
  });
}

export async function apiChatStream(
  token: string,
  input: Parameters<typeof apiChat>[1],
  onChunk: (chunk: { token?: string; action?: Record<string, unknown>; error?: string }) => void,
): Promise<void> {
  const response = await fetch(`${getApiUrl()}/ai/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch {
      // ignore
    }
    throw new ApiError(response.status, message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        onChunk(JSON.parse(payload) as { token?: string; action?: Record<string, unknown>; error?: string });
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
