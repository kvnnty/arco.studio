export type CompositionMode = "preview" | "export";

export type CompileOptions = {
  assetBaseUrl?: string;
  mode?: CompositionMode;
};

export type QualitySeverity = "error" | "warning" | "note";

export type QualityFinding = {
  code: string;
  severity: QualitySeverity;
  message: string;
  sceneId?: string;
};

export type QualityReport = {
  score: number;
  passed: boolean;
  findings: QualityFinding[];
};

export type CompiledVideo = {
  html: string;
  durationSeconds: number;
  quality: QualityReport;
};
