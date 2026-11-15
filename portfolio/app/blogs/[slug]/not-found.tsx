import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <div className="page narrow">
      <p className="eyebrow">404 · Missing page</p>
      <h1>This post isn’t in the can</h1>
      <p className="lede">There’s no post at this address. It may have been edited, or the link has a typo.</p>
      <Link href="/blogs" className="text-link">
        ← Back to the blog
      </Link>
    </div>
  );
}
