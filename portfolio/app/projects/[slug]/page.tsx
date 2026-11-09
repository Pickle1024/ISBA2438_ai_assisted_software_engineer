import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import FilmFrame from "@/components/FilmFrame";
import { getProjectBySlug, projects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProjectBySlug(slug)?.title ?? "Project not found" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="page narrow project-detail" style={{ "--accent": project.accent } as CSSProperties}>
      <Link href="/projects" className="text-link">
        ← All projects
      </Link>
      <p className="eyebrow">
        {project.lens} · {project.role} · {project.period}
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
      <figure className="project-cover">
        <FilmFrame project={project} />
        {project.cover.caption && <figcaption>{project.cover.caption}</figcaption>}
      </figure>

      <dl className="stats">
        {project.stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>

      <h2>The context</h2>
      <p>{project.context}</p>

      <h2>What I did</h2>
      <ul>
        {project.whatIDid.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {project.gallery && (
        <div className="media-gallery">
          {project.gallery.map((item) => (
            <figure key={item.src}>
              {item.kind === "video" ? (
                <video src={item.src} poster={item.poster} controls playsInline preload="none" aria-label={item.alt} />
              ) : (
                <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 760px) 100vw, 760px" />
              )}
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}

      {project.links.length > 0 && (
        <>
          <h2>Watch</h2>
          <ul className="plain-links">
            {project.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label} ↗</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
