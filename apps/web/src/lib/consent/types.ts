export type ConsentCategories = {
  /** Always true — auth, security, consent storage */
  essential: true;
  /** UI preferences such as sidebar state */
  functional: boolean;
  /** Google Analytics and similar usage analytics */
  analytics: boolean;
  /** Client-side error and performance monitoring (Sentry) */
  monitoring: boolean;
};

export type ConsentRecord = {
  categories: ConsentCategories;
  updatedAt: string;
  version: number;
};

export type ConsentChoices = Omit<ConsentCategories, "essential">;
