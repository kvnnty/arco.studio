"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  joinWaitlist,
  type WaitlistState,
} from "@/app/actions/waitlist";
import { Button } from "@/components/ui/button";

const initialState: WaitlistState = { status: "idle" };

function WaitlistSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 shrink-0 disabled:opacity-60"
    >
      {pending ? "Joining…" : "Join waitlist"}
    </Button>
  );
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, initialState);

  if (state.status === "success") {
    return (
      <p
        className="text-[15px] font-medium tracking-[0.02em] text-green-500"
        role="status"
      >
        You’re on the list. We’ll be in touch.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor="waitlist-email" className="sr-only">
          Email
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          aria-invalid={state.status === "error"}
          aria-describedby={
            state.status === "error" ? "waitlist-error" : undefined
          }
          className="h-11 w-full rounded-lg border border-border bg-input px-4 text-[15px] font-medium tracking-[0.02em] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {state.status === "error" ? (
          <p
            id="waitlist-error"
            className="text-[13px] font-medium tracking-[0.02em] text-destructive"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}
      </div>
      <WaitlistSubmitButton />
    </form>
  );
}
