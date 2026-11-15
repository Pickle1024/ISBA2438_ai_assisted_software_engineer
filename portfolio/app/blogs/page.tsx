import type { Metadata } from "next";

import BlogList from "./BlogList";

export const metadata: Metadata = { title: "Blog" };

export default function BlogsPage() {
  return (
    <div className="page narrow">
      <p className="eyebrow">Blog</p>
      <h1>Notes from the cutting room</h1>
      <BlogList />
    </div>
  );
}
