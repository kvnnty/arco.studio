import type { CSSProperties, ReactNode } from "react";

type DeviceFrameProps = {
  platform: "web" | "mobile" | "both";
  children: ReactNode;
  accent?: string;
};

/**
 * Browser chrome (web) or phone bezel (mobile) around screenshot content.
 */
export function DeviceFrame({
  platform,
  children,
  accent = "#333",
}: DeviceFrameProps) {
  const isMobile = platform === "mobile";

  if (isMobile) {
    const shell: CSSProperties = {
      width: "42%",
      maxWidth: 420,
      aspectRatio: "9 / 19.5",
      borderRadius: 36,
      border: `3px solid ${accent}88`,
      backgroundColor: "#0a0a0a",
      boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <div style={shell}>
        <div
          style={{
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
          }}
        >
          <div
            style={{
              width: 72,
              height: 8,
              borderRadius: 999,
              backgroundColor: "#222",
            }}
          />
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  const shell: CSSProperties = {
    width: "78%",
    maxWidth: 1280,
    aspectRatio: "16 / 10",
    borderRadius: 14,
    border: `1px solid ${accent}55`,
    backgroundColor: "#12141a",
    boxShadow: "0 48px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={shell}>
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          backgroundColor: "#1a1d24",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div
          style={{
            flex: 1,
            height: 20,
            marginLeft: 8,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
