"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteProjectMutation } from "@/lib/api/hooks/projects";

type DeleteProjectDialogProps = {
  projectId: string;
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
};

export function DeleteProjectDialog({
  projectId,
  projectTitle,
  open,
  onOpenChange,
  redirectTo = "/dashboard/projects",
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const deleteProject = useDeleteProjectMutation();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project deleted — slot freed.");
      onOpenChange(false);
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete project.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            Delete <strong>{projectTitle}</strong> to free a project slot. This
            cannot be undone — recordings and exports for this project will be
            removed from your workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteProject.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting…" : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteProjectTriggerProps = {
  projectId: string;
  projectTitle: string;
  redirectTo?: string;
  children: (props: { onClick: () => void }) => ReactNode;
};

export function DeleteProjectTrigger({
  projectId,
  projectTitle,
  redirectTo,
  children,
}: DeleteProjectTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children({ onClick: () => setOpen(true) })}
      <DeleteProjectDialog
        projectId={projectId}
        projectTitle={projectTitle}
        open={open}
        onOpenChange={setOpen}
        redirectTo={redirectTo}
      />
    </>
  );
}
