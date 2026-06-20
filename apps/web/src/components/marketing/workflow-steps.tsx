import { MotionStagger, MotionStaggerItem } from "@/components/marketing/motion/motion-stagger";

type WorkflowStep = {
  step: string;
  title: string;
  description: string;
};

export function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  return (
    <MotionStagger className="mt-16 grid gap-8 sm:grid-cols-3" stagger={0.12}>
      {steps.map((step) => (
        <MotionStaggerItem key={step.step}>
          <span className="text-[13px] font-semibold text-primary">{step.step}</span>
          <h3 className="mt-2 text-[18px] font-semibold">{step.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-marketing-muted">
            {step.description}
          </p>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
