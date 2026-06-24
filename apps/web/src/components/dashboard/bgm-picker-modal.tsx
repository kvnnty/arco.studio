"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BgmTrackGrid } from "@/components/dashboard/bgm-track-grid";
import type { MusicTrackId } from "@/lib/editor/music-tracks";

type BgmPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: MusicTrackId | null;
  onSelect: (id: MusicTrackId | null) => void;
};

export function BgmPickerModal({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: BgmPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Background music</DialogTitle>
          <DialogDescription>
            Pick a track for your launch video. Preview before you create.
          </DialogDescription>
        </DialogHeader>
        <BgmTrackGrid
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
