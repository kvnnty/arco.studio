export type PipelineStepId =
  | "analyze"
  | "draft"
  | "voice"
  | "layout"
  | "scenes"
  | "stitch";

export type PipelineStep = {
  id: PipelineStepId;
  label: string;
  description: string;
};

export const GENERATION_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "analyze",
    label: "Analyze brief",
    description: "Read product URL, screenshots, brand, and goal",
  },
  {
    id: "draft",
    label: "Write beat sheet",
    description: "Plan scenes, hierarchy, timing, and CTA",
  },
  {
    id: "voice",
    label: "Record voice",
    description: "Generate narration for the approved beats",
  },
  {
    id: "layout",
    label: "Design frames",
    description: "Apply typography, colors, and composition",
  },
  {
    id: "scenes",
    label: "Animate scenes",
    description: "Add easing, transitions, callouts, and titles",
  },
  {
    id: "stitch",
    label: "Prepare delivery",
    description: "Combine scenes into an export-ready video",
  },
];

export type PipelineState = {
  activeStep: PipelineStepId;
  completedSteps: PipelineStepId[];
  sceneCount?: number;
  targetDurationSec?: number;
  waitingForCredits?: boolean;
};

export function createInitialPipelineState(): PipelineState {
  return {
    activeStep: "analyze",
    completedSteps: [],
  };
}

export function pipelineIndex(step: PipelineStepId): number {
  return GENERATION_PIPELINE_STEPS.findIndex((item) => item.id === step);
}

export function advancePipeline(
  state: PipelineState,
  next: PipelineStepId,
  patch?: Partial<PipelineState>,
): PipelineState {
  const nextIndex = pipelineIndex(next);
  const completed = GENERATION_PIPELINE_STEPS.slice(0, nextIndex).map(
    (step) => step.id,
  );

  return {
    ...state,
    ...patch,
    activeStep: next,
    completedSteps: completed,
  };
}
