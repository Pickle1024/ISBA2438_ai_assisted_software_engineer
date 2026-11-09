import Image from "next/image";
import type { CSSProperties } from "react";

import LoopVideo from "@/components/LoopVideo";
import StatusWall from "@/components/StatusWall";
import type { Project } from "@/data/projects";

const SIZES = "(max-width: 760px) 100vw, 760px";

export default function FilmFrame({ project }: { project: Project }) {
  const { cover } = project;

  return (
    <div className="film-frame" style={{ "--accent": project.accent } as CSSProperties}>
      {cover.kind === "video" && <LoopVideo src={cover.src} poster={cover.poster} label={cover.alt} />}
      {cover.kind === "wall" && <StatusWall label={cover.alt} />}
      {cover.kind === "image" && cover.fit === "contain" && (
        <>
          <Image src={cover.src} alt="" fill sizes={SIZES} className="film-frame-media film-frame-blur" />
          <Image src={cover.src} alt={cover.alt} fill sizes={SIZES} className="film-frame-media film-frame-contain" />
        </>
      )}
      {cover.kind === "image" && cover.fit !== "contain" && (
        <Image src={cover.src} alt={cover.alt} fill sizes={SIZES} className="film-frame-media" />
      )}
    </div>
  );
}
