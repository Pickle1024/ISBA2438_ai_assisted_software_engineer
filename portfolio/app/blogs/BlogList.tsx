"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import StatusBanner from "@/components/StatusBanner";

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function BlogList() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setPosts(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (failed) {
    return (
      <div className="blog-list">
        <StatusBanner kind="error" title="Could not load posts">
          The /api/blogs request failed. Check the server and try again.
        </StatusBanner>
        <button type="button" className="button" onClick={() => setReloadKey((key) => key + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (posts === null) {
    return <p className="lede">Loading posts…</p>;
  }

  if (posts.length === 0) {
    return <p className="lede">No posts yet.</p>;
  }

  return (
    <div className="blog-list">
      {posts.map((post) => (
        <article key={post.id} className="blog-post">
          <p className="eyebrow">{post.createdAt.slice(0, 10)}</p>
          <h2>
            <Link className="blog-title-link" href={`/blogs/${post.slug}`}>
              {post.title}
            </Link>
          </h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
