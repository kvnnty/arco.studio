"use client";

import { useMemo, useState } from "react";
import { FileVideo, Film, Search } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_ASSETS } from "@/lib/mock/data";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_ASSETS.filter((asset) => {
      const matchesSearch = asset.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTab = tab === "all" || asset.type === tab;
      return matchesSearch && matchesTab;
    });
  }, [search, tab]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Assets"
        description="Your uploaded recordings and generated outputs."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recording">Recordings</TabsTrigger>
            <TabsTrigger value="output">Outputs</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value={tab} className="mt-6">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileVideo}
              title="No assets found"
              description="Upload a recording when creating a new project, or adjust your search filters."
              action={{
                label: "New project",
                href: "/dashboard/projects/new",
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((asset) => (
                <Card key={asset.id} className="rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/40">
                      {asset.type === "recording" ? (
                        <Film className="size-8 text-muted-foreground" />
                      ) : (
                        <FileVideo className="size-8 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm">
                          {asset.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {asset.size}
                          {asset.duration ? ` · ${asset.duration}` : ""}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {asset.type}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
