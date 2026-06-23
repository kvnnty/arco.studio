import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ArcoProject } from "@arco/project-schema";

import {
  createProject,
  fetchDashboardProject,
  fetchDashboardProjects,
  fetchEditorProject,
  syncProjectRecord,
} from "@/lib/api/projects";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiClient } from "@/lib/api/hooks/use-api-client";
import type { ProjectPlatform } from "@/lib/editor/create-project";

export function useProjects() {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => fetchDashboardProjects(token!),
    enabled: !!token && !loading,
  });
}

export function useProject(id: string) {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => fetchDashboardProject(token!, id),
    enabled: !!token && !loading && !!id,
  });
}

export function useEditorProject(projectId: string | null) {
  const { token, loading } = useApiClient();

  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ""),
    queryFn: () => fetchEditorProject(token!, projectId!),
    enabled: !!token && !loading && !!projectId,
  });
}

export function useCreateProjectMutation() {
  const { token } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      platform: ProjectPlatform;
      templateId?: string;
      brief?: { intent?: string; productUrl?: string };
      stylePreset?: import("@arco/project-schema").StylePreset;
      exportFormat?: import("@arco/project-schema").ExportFormat;
    }) => {
      if (!token) throw new Error("Not authenticated");
      return createProject(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useSyncProjectMutation() {
  const { token } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      projectId: string;
      project: ArcoProject;
      platform: ProjectPlatform;
      recordingSrc: string;
      thumbnailUrl?: string;
    }) => {
      if (!token) throw new Error("Not authenticated");
      return syncProjectRecord(token, input);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.projectId),
      });
    },
  });
}
