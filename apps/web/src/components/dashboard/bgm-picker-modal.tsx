"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BgmTrackGrid } from "@/components/dashboard/bgm-track-grid";
import {
  CustomMusicUpload,
  type CustomMusicSelection,
} from "@/components/dashboard/custom-music-upload";
import type { MusicTrackId } from "@/lib/editor/music-tracks";
import type { AccessTokenSource } from "@/lib/auth/constants";

type BgmPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: MusicTrackId | null;
  onSelectLibrary: (id: MusicTrackId | null) => void;
  customMusic: CustomMusicSelection | null;
  onSelectCustom: (selection: CustomMusicSelection | null) => void;
  accessToken?: AccessTokenSource;
  canUploadCustomMusic?: boolean;
};

export function BgmPickerModal({
  open,
  onOpenChange,
  selectedId,
  onSelectLibrary,
  customMusic,
  onSelectCustom,
  accessToken,
  canUploadCustomMusic = false,
}: BgmPickerModalProps) {
  const [tab, setTab] = useState<"library" | "custom">("library");

  useEffect(() => {
    if (open) {
      setTab(customMusic ? "custom" : "library");
    }
  }, [open, customMusic]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Background music</DialogTitle>
          <DialogDescription>
            Pick a library track or upload your own (Pro).
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "library" | "custom")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="custom">Your upload</TabsTrigger>
          </TabsList>

          <TabsContent
            value="library"
            className="mt-4 max-h-[min(28rem,60vh)] overflow-y-auto pr-1"
          >
            <BgmTrackGrid
              active={open}
              selectedId={customMusic ? null : selectedId}
              onSelect={(id) => {
                onSelectCustom(null);
                onSelectLibrary(id);
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <CustomMusicUpload
              accessToken={accessToken}
              canUpload={canUploadCustomMusic}
              selected={customMusic}
              onSelect={(selection) => {
                onSelectCustom(selection);
                if (selection) {
                  onOpenChange(false);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
