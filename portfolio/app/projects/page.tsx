import type { Metadata } from "next";

import ProjectCard from "@/components/ProjectCard";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

// Projects live in storage/projects.json, so the page renders per request.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getAllProjects();
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
