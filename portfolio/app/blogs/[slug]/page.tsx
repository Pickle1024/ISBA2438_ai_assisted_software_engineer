import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/blogs";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Post not found" };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article className="page narrow">
      <p>
        <Link href="/blogs" className="text-link">
          ← All posts
        </Link>
      </p>
      <p className="eyebrow">{post.createdAt.slice(0, 10)}</p>
      <h1>{post.title}</h1>
      {paragraphs.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </article>
  );
}
