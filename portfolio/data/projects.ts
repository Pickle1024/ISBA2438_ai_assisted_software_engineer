export type ProjectCover =
  | { kind: "video"; src: string; poster: string; alt: string; caption?: string }
  | { kind: "image"; src: string; alt: string; fit?: "cover" | "contain"; caption?: string }
  | { kind: "wall"; alt: string; caption?: string };

export type GalleryItem = {
  kind: "image" | "video";
  src: string;
  poster?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  lens: string;
  lensHook: string;
  title: string;
  summary: string;
  role: string;
  period: string;
  stats: { value: string; label: string }[];
  context: string;
  whatIDid: string[];
  links: { label: string; href: string }[];
  accent: string;
  cover: ProjectCover;
  gallery?: GalleryItem[];
};

export const projects: Project[] = [
  {
    slug: "picklens",
    lens: "Storyteller",
    lensHook: "I make complex things easy to understand through video, motion and narrative.",
    title: "PickLens",
    summary: "A show that makes AI infrastructure easy to understand.",
    role: "Creator",
    period: "Ongoing",
    stats: [
      { value: "2", label: "episodes published" },
      { value: "EN / 中", label: "subtitles on every episode" },
    ],
    context:
      "Everyone watches AI models and apps. I wanted to understand the layer underneath: power, chips and data centers. PickLens is me learning in public. I research one topic for weeks, then turn it into a video where every number becomes something you can see.",
    whatIDid: [
      "Read reports, earnings calls and keynotes for each topic.",
      "Turned the research into one clear story per episode.",
      "Built every data visual in code, so the numbers move.",
      "Filmed, cut and added English and Chinese subtitles.",
    ],
    links: [
      { label: "YouTube channel", href: "https://www.youtube.com/@picklens1024" },
      { label: "EP 01: The 3 Biggest Bottlenecks for AI", href: "https://www.youtube.com/watch?v=g462la-Glu8" },
      { label: "EP 02: Understand Jensen Huang's GTC Keynote", href: "https://www.youtube.com/watch?v=96F331XdZ18" },
    ],
    accent: "#c9a46a",
    cover: {
      kind: "video",
      src: "/media/picklens-loop.mp4",
      poster: "/media/picklens-still.jpg",
      alt: "Zoe speaking to camera in a PickLens episode",
    },
    gallery: [
      {
        kind: "video",
        src: "/media/picklens-highlight.mp4",
        poster: "/media/picklens-still.jpg",
        width: 1920,
        height: 1080,
        alt: "PickLens highlight reel with English and Chinese subtitles",
        caption: "A 35-second highlight from PickLens.",
      },
    ],
  },
  {
    slug: "tutu",
    lens: "Builder",
    lensHook: "I build things people pay for.",
    title: "TUTU",
    summary: "A grad-school exam prep brand I built from zero on Xiaohongshu, with no paid ads.",
    role: "Founder",
    period: "2022–2025",
    stats: [
      { value: "70K+", label: "followers, all platforms combined" },
      { value: "480K+", label: "likes and saves" },
      { value: "3,000+", label: "paying customers" },
      { value: "1,600", label: "person community" },
      { value: "200+", label: "videos" },
      { value: "~40%", label: "CAC below the industry average" },
    ],
    context:
      "Every year, millions of students in China prepare for the graduate school entrance exam, often on their own. I wanted to see whether clear, method-first content could build enough trust to grow into a business.",
    whatIDid: [
      "Made short videos that each teach one concrete method, like memorizing 150 words a day or answering interview questions in English.",
      "Turned followers into a 1,600-person community.",
      "Converted that trust into 3,000+ paying customers with organic content only.",
    ],
    links: [],
    accent: "#ff5a3c",
    cover: {
      kind: "image",
      src: "/media/tutu-top-post.jpg",
      alt: "TUTU's top Xiaohongshu post, on memorizing 150 words a day, with 1.6M views",
      fit: "contain",
      caption: "Top post: 1.6M views, 150K+ likes.",
    },
    gallery: [
      {
        kind: "image",
        src: "/media/tutu-profile.jpg",
        width: 1206,
        height: 409,
        alt: "TUTU's Xiaohongshu profile showing 46K followers and 483.4K likes and saves",
        caption: "The Xiaohongshu account alone: 46K followers, 483.4K likes and saves.",
      },
    ],
  },
  {
    slug: "marketing-agents",
    lens: "Analyst",
    lensHook: "Market data, turned into briefings each team can use.",
    title: "AI Agents for Marketing",
    summary: "AI agents I built and shipped at Lam Research: custom newsletters for 10 teams and 30+ users.",
    role: "Marketing Analyst Intern, Lam Research",
    period: "Jan–Sep 2026",
    stats: [
      { value: "30+", label: "users when I left" },
      { value: "10", label: "custom newsletter workflows" },
      { value: "4", label: "source formats" },
    ],
    context:
      "Teams at a semiconductor company followed the market across news, earnings calls, PDF reports and patents. Each source looks different and each team asks different questions. I started this as a BI Analyst practicum and stayed for the summer as a Marketing Analyst Intern to get it into people's hands, inside the company's approved tools.",
    whatIDid: [
      "Prototyped retrieval across all four source formats, with a citation on every claim.",
      "Rebuilt it on Copilot Studio, the company's approved platform, and shipped it.",
      "Gave each of the 10 teams its own newsletter workflow instead of one generic digest.",
      "Automated monitoring: the agent searches, writes an HTML report and delivers it to email and Teams.",
      "Wrote the demo script and Quick Start Guide, and recorded a 40-minute handoff video so the teams could run it without me.",
    ],
    links: [],
    accent: "#e8e8e8",
    cover: {
      kind: "video",
      src: "/media/agent-pipeline.mp4",
      poster: "/media/agent-pipeline.jpg",
      alt: "Animation of documents flowing into a shared library and being matched to ten team profiles",
      caption: "Illustrative animation of the prototype pipeline. No real data shown.",
    },
  },
  {
    slug: "zoe-os",
    lens: "Explorer",
    lensHook: "Agents do the middle of the work. I keep the first and the last step.",
    title: "Zoe OS",
    summary: "The AI system I run my job search and daily files on.",
    role: "Builder and daily user",
    period: "Ongoing",
    stats: [
      { value: "3", label: "steps that stay mine: pick, review, send" },
      { value: "1", label: "folder of plain files every agent reads" },
    ],
    context:
      "Every new AI chat started from zero, and job searching meant ten tabs and a spreadsheet. I wanted agents to do the middle of the work while I keep the first and the last step.",
    whatIDid: [
      "An agent reads each job description against my criteria and explains every role it skips. I pick which ones to go for.",
      "Each role gets a tailored résumé PDF, auto-checked for one page and working links. I give it a final read.",
      "Referral notes get drafted in Chinese or English depending on the person. I press send.",
      "Every agent reads the same folder of plain files before it starts and writes decisions back when it's done.",
    ],
    links: [],
    accent: "#9cc9bd",
    cover: {
      kind: "wall",
      alt: "Status wall: career and life automations, each ready and waiting for Zoe's final call",
      caption: "The status wall. Every row stops at me.",
    },
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
