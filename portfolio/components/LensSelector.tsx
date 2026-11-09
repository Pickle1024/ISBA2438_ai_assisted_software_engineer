"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";

import FilmFrame from "@/components/FilmFrame";
import LensViewer from "@/components/LensViewer";
import type { Project } from "@/data/projects";

export default function LensSelector({ projects, children }: { projects: Project[]; children?: ReactNode }) {
  const [selectedSlug, setSelectedSlug] = useState(projects[0].slug);
  const selected = projects.find((project) => project.slug === selectedSlug) ?? projects[0];
  const selectedIndex = projects.indexOf(selected);

  function turnLens(direction: number) {
    const next = (selectedIndex + direction + projects.length) % projects.length;
    setSelectedSlug(projects[next].slug);
  }

  return (
    <section className="lens-selector" style={{ "--accent": selected.accent } as CSSProperties}>
      {children}
      <div className="lens-stage">
        <div className="lens-copy">
          <LensViewer mark={selectedIndex} accent={selected.accent} onTurn={turnLens} />
          <p className="eyebrow">Lens {selectedIndex + 1} of {projects.length}</p>
          <h1>{selected.lens}</h1>
          <p className="lede">{selected.lensHook}</p>
        </div>
        <div className="lens-screen">
          <FilmFrame key={selected.slug} project={selected} />
          <h2>{selected.title}</h2>
          <p>{selected.summary}</p>
          <Link href={`/projects/${selected.slug}`} className="text-link">
            Open {selected.title} →
          </Link>
        </div>
      </div>

      <div className="film-strip" role="group" aria-label="Pick a lens">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            aria-pressed={project.slug === selected.slug}
            onClick={() => setSelectedSlug(project.slug)}
          >
            <small>0{index + 1}</small>
            {project.lens}
          </button>
        ))}
      </div>
    </section>
  );
}
