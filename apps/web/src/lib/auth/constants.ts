export type ProductUser = {
  id: string;
  clerkUserId: string | null;
  email: string;
  name: string | null;
  onboardingCompleted: boolean;
  onboardingStep: string;
};

export type AccessTokenProvider = () => Promise<string | null>;
export type AccessTokenSource = string | AccessTokenProvider;
