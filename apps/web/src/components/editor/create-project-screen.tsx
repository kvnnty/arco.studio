"use client";

import type { ProjectPlatform } from "@/lib/editor/create-project";
import { Monitor, Smartphone, Upload } from "lucide-react";
import { useState } from "react";

import { JourneyStepper } from "@/components/editor/journey-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type CreateProjectScreenProps = {
  onContinue: (name: string, platform: ProjectPlatform) => void | Promise<void>;
  loading?: boolean;
};

const platforms: {
  id: ProjectPlatform;
  label: string;
  description: string;
  icon: typeof Monitor;
}[] = [
  {
    id: "web",
    label: "Web App",
    description: "Browser-based product demo",
    icon: Monitor,
  },
  {
    id: "mobile",
    label: "Mobile App",
    description: "iOS or Android screen recording",
    icon: Smartphone,
  },
  {
    id: "both",
    label: "Both",
    description: "Mixed web and mobile clips",
    icon: Upload,
  },
];

export function CreateProjectScreen({
  onContinue,
  loading = false,
}: CreateProjectScreenProps) {
  const [name, setName] = useState("My launch video");
  const [platform, setPlatform] = useState<ProjectPlatform>("web");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-8">
      <JourneyStepper current="create" className="mb-8" />

      <Badge variant="outline" className="w-fit text-accent-foreground">
        Step 1 · Create project
      </Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
        New project
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        You bring the product. Arco adds the motion design — starting with your
        real screen recording.
      </p>

      <FieldGroup className="mt-10">
        <Field>
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <FieldContent>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sploy launch video"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Product type</FieldLabel>
          <FieldContent>
            <ToggleGroup
              value={[platform]}
              onValueChange={(value) => {
                const next = value[0] as ProjectPlatform | undefined;
                if (next) setPlatform(next);
              }}
              variant="outline"
              spacing={0}
              className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0"
            >
              {platforms.map((option) => {
                const Icon = option.icon;
                return (
                  <ToggleGroupItem
                    key={option.id}
                    value={option.id}
                    className="h-auto flex-col items-start gap-2 px-4 py-4 text-left sm:rounded-none sm:first:rounded-l-lg sm:last:rounded-r-lg"
                  >
                    <Icon className="size-4 text-accent-foreground" />
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {option.description}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button
        className="mt-10 w-fit"
        disabled={!name.trim() || loading}
        onClick={() => void onContinue(name.trim(), platform)}
      >
        {loading ? "Creating project…" : "Continue to upload"}
      </Button>
    </div>
  );
}
