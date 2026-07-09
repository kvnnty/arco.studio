import type { ArcoProject } from "@arco/project-schema";
import type { AxiosRequestConfig } from "axios";

import { ApiError, createApiClient } from "@/lib/api/axios";
import { getApiUrl } from "@/lib/api/config";

export { ApiError, getApiUrl };

type ApiRequestOptions = {
  token?: string;
  method?: string;
  body?: unknown;
  formData?: FormData;
  onUploadProgress?: (percent: number) => void;
};

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    token,
    method = "GET",
    body,
    formData,
    onUploadProgress,
  } = options;

  const client = createApiClient(token);
  const config: AxiosRequestConfig = {
    method,
    url: path,
    data: formData ?? body,
    headers: formData ? { "Content-Type": "multipart/form-data" } : undefined,
    onUploadProgress: onUploadProgress
      ? (event) => {
          if (!event.total) return;
          onUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      : undefined,
  };

  const response = await client.request<T>(config);

  if (response.status === 204) {
    return undefined as T;
  }

  return response.data;
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

export async function apiRequestMagicLink(email: string, referralCode?: string) {
  return apiRequest<{ sent: boolean }>(
    "/auth/magic-link",
    {
      method: "POST",
      body: {
        email: email.trim().toLowerCase(),
        ...(referralCode ? { referralCode } : {}),
      },
    },
  );
}

export async function apiVerifyMagicLink(
  token: string,
): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>("/auth/magic-link/verify", {
    method: "POST",
    body: { token },
  });
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>("/auth/login", {
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
  referralCode?: string;
}): Promise<{ sent: boolean; message: string }> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      ...(input.referralCode ? { referralCode: input.referralCode } : {}),
    },
  });
}

export async function apiForgotPassword(email: string) {
  return apiRequest<{ sent: boolean; message: string }>(
    "/auth/password/forgot",
    {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
    },
  );
}

export async function apiResetPassword(input: {
  token: string;
  password: string;
}) {
  return apiRequest("/auth/password/reset", {
    method: "POST",
    body: input,
  });
}

export async function apiCompleteOAuth(token: string) {
  return apiRequest<AuthTokensResponse>("/auth/oauth/complete", {
    method: "POST",
    body: { token },
  });
}

export async function apiCompleteOnboarding(
  token: string,
  input: { name?: string; step?: string },
) {
  return apiRequest("/auth/onboarding", {
    token,
    method: "PATCH",
    body: input,
  });
}

export async function apiLogout(refreshToken: string) {
  return apiRequest("/auth/logout", {
    method: "POST",
    body: { refreshToken },
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
  return apiRequest<ApiProjectRecord>(`/projects/${projectId}`, { token });
}

export async function apiListProjects(
  token: string,
): Promise<ApiProjectRecord[]> {
  return apiRequest<ApiProjectRecord[]>("/projects", { token });
}

export async function apiCreateProject(
  token: string,
  input: {
    title: string;
    platform: string;
    exportFormat?: string;
    stylePreset?: string;
    templateId?: string;
    brief?: { intent?: string; productUrl?: string };
    projectMode?: string;
    projectData?: ArcoProject;
  },
): Promise<ApiProjectRecord> {
  return apiRequest<ApiProjectRecord>("/projects", {
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
  return apiRequest<ApiProjectRecord>(`/projects/${projectId}`, {
    token,
    method: "PATCH",
    body: input,
  });
}

export async function apiDeleteProject(
  token: string,
  projectId: string,
): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/projects/${projectId}`, {
    token,
    method: "DELETE",
  });
}

export async function uploadRecordingWithProgress(
  token: string,
  file: File,
  durationMs: number,
  onProgress?: (percent: number) => void,
): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("durationMs", String(durationMs));

  return apiRequest<{ key: string; url: string }>("/uploads", {
    token,
    method: "POST",
    formData,
    onUploadProgress: onProgress,
  });
}

export async function uploadThumbnail(
  token: string,
  file: File,
): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ key: string; url: string }>("/uploads/thumbnail", {
    token,
    method: "POST",
    formData,
  });
}

export async function uploadImageWithProgress(
  token: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ key: string; url: string }>("/uploads/image", {
    token,
    method: "POST",
    formData,
    onUploadProgress: onProgress,
  });
}

export async function uploadMusic(
  token: string,
  file: File,
): Promise<{ key: string; url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ key: string; url: string; filename: string }>(
    "/uploads/music",
    {
      token,
      method: "POST",
      formData,
    },
  );
}

export type GenerateStoryboardResponse = {
  scenes: import("@arco/project-schema").ScreenshotScene[];
  stylePreset: import("@arco/project-schema").StylePreset;
  source: "llm" | "heuristic";
};

export async function apiGenerateStoryboard(
  token: string,
  input: {
    title: string;
    imageUrls: string[];
    intent?: string;
    productUrl?: string;
    templateId?: string;
    targetDurationMs?: number;
    brief?: { intent?: string; productUrl?: string };
  },
): Promise<GenerateStoryboardResponse> {
  return apiRequest<GenerateStoryboardResponse>("/ai/generate-storyboard", {
    token,
    method: "POST",
    body: input,
  });
}

export type ArcoVoice = {
  id: string;
  name: string;
  accent: string;
  gender: string;
  previewText: string;
};

export async function apiListVoices(): Promise<ArcoVoice[]> {
  return apiRequest<ArcoVoice[]>("/voice/voices");
}

export async function apiPreviewVoice(
  token: string,
  input: { voiceId: string; text?: string },
): Promise<{ audioBase64: string; contentType: string }> {
  return apiRequest<{ audioBase64: string; contentType: string }>(
    "/voice/preview",
    { token, method: "POST", body: input },
  );
}

export async function apiGenerateVoice(
  token: string,
  input: {
    voiceId?: string;
    scenes: Array<{ id: string; voScript: string }>;
  },
): Promise<{
  voiceId: string;
  scenes: Array<{ id: string; voScript: string; voAudioSrc: string }>;
}> {
  return apiRequest("/voice/generate", {
    token,
    method: "POST",
    body: input,
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
  input: { projectId: string; quality?: "720p" | "1080p" | "4k"; format?: string },
): Promise<RenderJobRecord> {
  return apiRequest<RenderJobRecord>("/renders", {
    token,
    method: "POST",
    body: input,
  });
}

export async function apiGetRender(
  token: string,
  jobId: string,
): Promise<RenderJobRecord> {
  return apiRequest<RenderJobRecord>(`/renders/${jobId}`, { token });
}

export async function apiGenerateDraft(
  token: string,
  input: {
    title: string;
    durationMs: number;
    platform?: string;
    intent?: string;
    productUrl?: string;
    templateId?: string;
    templateContext?: {
      name: string;
      copyTone: string;
      sceneCount: number;
      sceneHints: string[];
      stylePreset: string;
    };
    brandContext?: {
      title?: string;
      description?: string;
      tone?: string;
      colors?: { primary: string; background: string };
    };
  },
): Promise<GenerateDraftResponse> {
  return apiRequest<GenerateDraftResponse>("/ai/generate-draft", {
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
  return apiRequest<RegenerateMarkerResponse>("/ai/regenerate-marker", {
    token,
    method: "POST",
    body: input,
  });
}

export type RefineProjectResponse = {
  markers: Array<{
    callout: { text: string; subtext?: string };
    label?: string;
  }>;
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
  return apiRequest<RefineProjectResponse>("/ai/refine-project", {
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
  return apiRequest<ChatResponse>("/ai/chat", {
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
  pageContent?: string;
  pageContentChars?: number;
  colors: { primary: string; background: string };
  tone?: "technical" | "consumer" | "enterprise";
  source: "scrape" | "fallback";
};

export async function apiAnalyzeBrandUrl(
  token: string,
  url: string,
): Promise<BrandKitResponse> {
  return apiRequest<BrandKitResponse>("/brand/analyze-url", {
    token,
    method: "POST",
    body: { url },
  });
}

export async function apiPreviewBrandUrl(
  token: string,
  url: string,
): Promise<BrandKitResponse> {
  return apiRequest<BrandKitResponse>("/brand/preview-url", {
    token,
    method: "POST",
    body: { url },
  });
}

export type BillingStatus = {
  planStatus: string;
  plan: string | null;
  activeProjectCount: number;
  activeProjectLimit: number;
  activeProjectsRemaining: number;
  hasUnlimitedProjects: boolean;
  periodEnd: string | null;
  canUseProduct: boolean;
  canUploadCustomMusic: boolean;
  allowedExportQualities: Array<"720p" | "1080p" | "4k">;
  maxProjectDurationMs: number;
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
  return apiRequest<BillingStatus>("/billing/status", { token });
}

export async function apiGetBillingUsage(token: string): Promise<BillingUsage> {
  return apiRequest<BillingUsage>("/billing/usage", { token });
}

export type CheckoutPlan = "trial" | "pro" | "studio";
export type BillingInterval = "monthly" | "annual";

export async function apiCreateBillingCheckout(
  token: string,
  plan: CheckoutPlan,
  interval: BillingInterval = "monthly",
): Promise<{ url: string }> {
  return apiRequest<{ url: string }>("/billing/checkout-session", {
    token,
    method: "POST",
    body: { plan, interval },
  });
}

export async function apiCreateBillingPortal(
  token: string,
): Promise<{ url: string }> {
  return apiRequest<{ url: string }>("/billing/portal-session", {
    token,
    method: "POST",
    body: {},
  });
}

export type ReferralInvite = {
  id: string;
  email: string;
  status: "pending" | "rewarded";
  creditsAwarded: number;
  createdAt: string;
  rewardedAt: string | null;
};

export type ReferralSummary = {
  code: string;
  link: string;
  creditsPerReferral: number;
  stats: {
    pending: number;
    rewarded: number;
    creditsEarned: number;
  };
  invites: ReferralInvite[];
};

export async function apiGetReferrals(token: string): Promise<ReferralSummary> {
  return apiRequest<ReferralSummary>("/referrals", { token });
}

export type AuthSessionRecord = {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  lastUsedAt: string;
  createdAt: string;
  current: boolean;
};

export async function apiUpdateProfile(
  token: string,
  input: { name?: string },
) {
  return apiRequest("/users/me", {
    token,
    method: "PATCH",
    body: input,
  });
}

export async function apiListSessions(token: string) {
  return apiRequest<AuthSessionRecord[]>("/auth/sessions", { token });
}

export async function apiRevokeSession(token: string, sessionId: string) {
  return apiRequest(`/auth/sessions/${sessionId}`, {
    token,
    method: "DELETE",
  });
}

export async function apiChatStream(
  token: string,
  input: Parameters<typeof apiChat>[1],
  onChunk: (chunk: {
    token?: string;
    action?: Record<string, unknown>;
    error?: string;
  }) => void,
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
        onChunk(
          JSON.parse(payload) as {
            token?: string;
            action?: Record<string, unknown>;
            error?: string;
          },
        );
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
