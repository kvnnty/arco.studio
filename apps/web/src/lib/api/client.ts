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

export type AuthResponse = {
  access_token: string;
  user: { id: string; email: string; name: string | null };
};

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
  createdAt: string;
  updatedAt: string;
  renderJobs?: Array<{
    id: string;
    status: string;
    outputUrl: string | null;
    format: string;
  }>;
};

export function parseProjectData(raw: string | ArcoProject): ArcoProject {
  if (typeof raw !== "string") return raw;
  if (!raw || raw === "{}") {
    throw new Error("Project data is empty");
  }
  return JSON.parse(raw) as ArcoProject;
}

export async function apiRegister(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      name: input.name?.trim(),
    },
  });
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  });
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
  },
): Promise<GenerateDraftResponse> {
  return apiFetch<GenerateDraftResponse>("/ai/generate-draft", {
    token,
    method: "POST",
    body: input,
  });
}
