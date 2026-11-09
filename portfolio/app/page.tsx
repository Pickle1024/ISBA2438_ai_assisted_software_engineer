import LensSelector from "@/components/LensSelector";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <LensSelector projects={projects}>
      <div className="home-intro">
        <p className="home-line">Making AI products easy to get.</p>
        <p className="eyebrow">Data × market · Build · Launch</p>
      </div>
    </LensSelector>
  );
}
