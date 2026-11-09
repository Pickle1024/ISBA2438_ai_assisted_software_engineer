import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About Me" };

const path = [
  { place: "Santa Clara University", detail: "MS in Business Analytics, class of December 2026." },
  {
    place: "Lam Research",
    detail: "Marketing Analyst Intern and BI Analyst Practicum, 2026. Built AI agents for marketing and shipped them to 30+ users across 10 teams.",
  },
  {
    place: "TUTU",
    detail: "Founder, 2022–2025. Built a grad-school exam prep brand to 70K+ followers across platforms and 3,000+ paying customers.",
  },
  {
    place: "Taoxiu New Media (Alibaba Group)",
    detail: "Marketing Analyst, 2021. Set up a content reserve that cut rush turnaround by 80%.",
  },
  { place: "Tencent", detail: "Marketing Analyst Intern, 2021. Built a 600+ project database and a trend dashboard." },
  { place: "iQIYI", detail: "Business Analyst Intern, 2020." },
  { place: "Beijing Film Academy", detail: "MFA, Film Production and Marketing, 2018–2021." },
];

export default function AboutMePage() {
  return (
    <div className="page narrow">
      <p className="eyebrow">About</p>
      <h1>I explain complicated things so other people care about them.</h1>
      <p className="lede">
        I’m Zoe Wang, based in the Bay Area and working toward product marketing roles at AI companies. I started in
        film school, moved into entertainment marketing, built a paying customer base from short videos, and then
        started building AI agents myself.
      </p>
      <p>
        I do my best work when I can design the system: the plan, the process, and the loop that makes it better each
        round. I also like seeing real results, the kind you can count in orders.
      </p>

      <h2>Where I’ve been</h2>
      <dl className="timeline">
        {path.map((item) => (
          <div key={item.place}>
            <dt>{item.place}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>

      <h2>About this site</h2>
      <p>
        My first portfolio was made in a no-code AI site builder. This version is a rebuild from scratch in Next.js, so
        I own the code, understand how it works, and can add stranger interactions later.
      </p>
      <Link href="/projects" className="text-link">
        See the projects →
      </Link>
    </div>
  );
}
