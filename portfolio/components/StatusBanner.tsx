import type { ReactNode } from "react";

type StatusBannerProps = {
  kind: "success" | "warning" | "error";
  title: string;
  children: ReactNode;
};

export default function StatusBanner({ kind, title, children }: StatusBannerProps) {
  return (
    <div className={`status-banner status-${kind}`} role={kind === "success" ? "status" : "alert"}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
