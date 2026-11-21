import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin" };

const adminPages = [
  {
    href: "/admin/projects",
    title: "Projects",
    description: "Add, edit and delete projects through /api/projects.",
  },
  {
    href: "/admin/blogs",
    title: "Blog",
    description: "Publish, edit and delete posts through /api/blogs.",
  },
  {
    href: "/admin/contact",
    title: "Contact",
    description: "Read, edit and delete contact messages through /api/contact.",
  },
];

export default function AdminIndexPage() {
  return (
    <div className="page contact-layout">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Manage the site</h1>
        <p className="lede">
          The admin pages behind the portfolio. Every change goes through the API and is stored in
          the backend JSON files. Not linked from the navigation — the footer has the entry.
        </p>
      </header>
      <div className="admin-list">
        {adminPages.map((page) => (
          <div key={page.href} className="admin-item">
            <p className="comment-meta">
              <span className="comment-name">
                <Link className="text-link" href={page.href}>
                  {page.title} →
                </Link>
              </span>
              <span>{page.href}</span>
            </p>
            <p className="comment-body">{page.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
