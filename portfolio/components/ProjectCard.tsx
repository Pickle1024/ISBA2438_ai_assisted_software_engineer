import Link from "next/link";

import FilmFrame from "@/components/FilmFrame";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-card">
      <FilmFrame project={project} />
      <p className="eyebrow">{project.lens}</p>
      <h2>{project.title}</h2>
      <p>{project.summary}</p>
    </Link>
  );
}
