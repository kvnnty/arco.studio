"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoiceGrid } from "@/components/dashboard/voice-grid";
import { apiListVoices, type ArcoVoice } from "@/lib/api/client";
import { ARCO_VOICES } from "@arco/project-schema/voices";

type VoicePickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVoiceId: string | null;
  voiceEnabled: boolean;
  onSelectVoice: (id: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
};

export function VoicePickerModal({
  open,
  onOpenChange,
  selectedVoiceId,
  voiceEnabled,
  onSelectVoice,
  onToggleEnabled,
}: VoicePickerModalProps) {
  const [voices, setVoices] = useState<ArcoVoice[]>([]);

  useEffect(() => {
    if (!open) return;
    void apiListVoices()
      .then(setVoices)
      .catch(() => {
        setVoices([...ARCO_VOICES]);
      });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Language &amp; Voice</DialogTitle>
          <DialogDescription>
            Pick a narrator for your launch video. Turn off for music and text
            only.
          </DialogDescription>
        </DialogHeader>
        <VoiceGrid
          voices={voices}
          selectedId={selectedVoiceId}
          voiceEnabled={voiceEnabled}
          onSelectVoice={onSelectVoice}
          onToggleEnabled={onToggleEnabled}
        />
      </DialogContent>
    </Dialog>
  );
}
