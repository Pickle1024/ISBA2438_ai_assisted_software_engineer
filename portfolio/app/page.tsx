import LensSelector from "@/components/LensSelector";
import { getAllProjects } from "@/lib/projects";

// Projects live in storage/projects.json, so the page renders per request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getAllProjects();
  return (
    <LensSelector projects={projects}>
      <div className="home-intro">
        <p className="home-line">Making AI products easy to get.</p>
        <p className="eyebrow">Data × market · Build · Launch</p>
      </div>
    </LensSelector>
  );
}
