import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/marketing/site-config";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#07080a",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e5ff00",
            }}
          />
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.name}
          </span>
        </div>
        <p
          style={{
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
            margin: 0,
          }}
        >
          {siteConfig.tagline}
        </p>
        <p
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            color: "#9c9c9d",
            maxWidth: "800px",
            marginTop: "24px",
          }}
        >
          {siteConfig.description}
        </p>
      </div>
    ),
    size,
  );
}
