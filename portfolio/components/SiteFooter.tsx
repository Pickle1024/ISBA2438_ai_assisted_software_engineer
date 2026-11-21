import Link from "next/link";

// Low-key, site-wide footer. The Admin link is the only way into the admin
// pages from the navigation-free public site.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <span>© 2026 Zoe Wang</span>
        <Link href="/admin">Admin</Link>
      </p>
    </footer>
  );
}
