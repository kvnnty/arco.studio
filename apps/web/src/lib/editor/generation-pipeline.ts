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
    label: "Analyze",
    description: "Fetch page, read content, extract brand",
  },
  {
    id: "draft",
    label: "Draft",
    description: "Scene list with VO script and timing",
  },
  {
    id: "voice",
    label: "Voice",
    description: "Record narration for each scene",
  },
  {
    id: "layout",
    label: "Layout",
    description: "Typography, colors, composition",
  },
  {
    id: "scenes",
    label: "Scenes",
    description: "Animate motion and titles per scene",
  },
  {
    id: "stitch",
    label: "Stitch",
    description: "Combine scenes into final video",
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
