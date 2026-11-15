import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact-me", label: "Contact" },
];

export default function SiteNav() {
  return (
    <header className="site-header">
      <Link href="/" className="site-name">
        Zoe Wang <span>Pick a lens</span>
      </Link>
      <nav aria-label="Main">
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
