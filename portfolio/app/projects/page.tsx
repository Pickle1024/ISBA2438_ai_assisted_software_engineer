import type { Metadata } from "next";

import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="page">
      <p className="eyebrow">Projects</p>
      <h1>One lens, one project</h1>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
