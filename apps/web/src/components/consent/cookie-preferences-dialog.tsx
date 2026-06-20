"use client";

import { useEffect, useState } from "react";

import { useConsent } from "@/components/consent/consent-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ConsentChoices } from "@/lib/consent/types";

type CookiePreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CookiePreferencesDialog({
  open,
  onOpenChange,
}: CookiePreferencesDialogProps) {
  const { consent, saveConsent, acceptAll } = useConsent();
  const [draft, setDraft] = useState<ConsentChoices>({
    functional: consent.functional,
    analytics: consent.analytics,
    monitoring: consent.monitoring,
  });

  useEffect(() => {
    if (open) {
      setDraft({
        functional: consent.functional,
        analytics: consent.analytics,
        monitoring: consent.monitoring,
      });
    }
  }, [open, consent]);

  function handleSave() {
    saveConsent(draft);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Choose which optional cookies and similar technologies we may use.
            Essential cookies are always active.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <PreferenceRow
            id="essential"
            title="Essential"
            description="Required for sign-in, security, and storing your consent choice."
            checked
            disabled
          />
          <PreferenceRow
            id="functional"
            title="Functional"
            description="Remember UI preferences such as sidebar layout."
            checked={draft.functional}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, functional: checked }))
            }
          />
          <PreferenceRow
            id="analytics"
            title="Analytics"
            description="Help us understand how Arco is used via Google Analytics."
            checked={draft.analytics}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, analytics: checked }))
            }
          />
          <PreferenceRow
            id="monitoring"
            title="Monitoring"
            description="Client-side error and performance reporting via Sentry."
            checked={draft.monitoring}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, monitoring: checked }))
            }
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => acceptAll()}>
            Accept all
          </Button>
          <Button onClick={handleSave}>Save preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type PreferenceRowProps = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function PreferenceRow({
  id,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {title}
        </Label>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
