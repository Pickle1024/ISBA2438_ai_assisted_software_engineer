import type { Metadata } from "next";
import Link from "next/link";

import BlogForm from "./BlogForm";

export const metadata: Metadata = { title: "Blog Admin" };

export default function BlogAdminPage() {
  return (
    <div className="page contact-layout">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Write a post</h1>
        <p className="lede">Publish straight to the blog through POST /api/blogs. This page is not in the site navigation.</p>
        <p className="plain-links">
          <Link className="text-link" href="/blogs">See all posts →</Link>
        </p>
      </header>
      <BlogForm />
    </div>
  );
}
