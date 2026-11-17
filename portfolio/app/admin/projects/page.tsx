import type { Metadata } from "next";

import ProjectManager from "./ProjectManager";

export const metadata: Metadata = { title: "Projects Admin" };

export default function ProjectsAdminPage() {
  return (
    <div className="page contact-layout">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Projects</h1>
        <p className="lede">
          Add, edit and delete projects through /api/projects. New projects get a plain cover and
          no gallery; edit the seed file for rich media. This page is not in the site navigation.
        </p>
      </header>
      <ProjectManager />
    </div>
  );
}
