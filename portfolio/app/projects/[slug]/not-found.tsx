import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="page narrow">
      <p className="eyebrow">404 · Missing scene</p>
      <h1>This reel isn’t in the can</h1>
      <p className="lede">There’s no project at this address. It may have been renamed, or the link has a typo.</p>
      <Link href="/projects" className="text-link">
        ← Back to all projects
      </Link>
    </div>
  );
}
