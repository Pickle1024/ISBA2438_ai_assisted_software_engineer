export type PromptCard = {
  label: string;
  text: string;
  note?: string;
};

export type LabCard = {
  id: string;
  kind: "prompt" | "skill";
  title: string;
  summary: string;
  date?: string;
  tools?: string;
  videoUrl?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  prompts?: PromptCard[];
  githubUrl?: string;
  downloadUrl?: string;
  accent?: string;
  image?: string;
};

export const labCards: LabCard[] = [
  {
    id: "claude-duet-remake",
    kind: "prompt",
    image: "/prompt-lab/claude-duet-remake.jpg",
    title: "Remaking the Claude Duet launch film: plain Claude vs. a motion skill",
    summary:
      "I remade the first 30 seconds of Anthropic's Claude Duet launch film twice with the exact same prompt: left is plain Claude in 10 minutes, right uses a motion-video-kit skill in 30. Same model, same brief — the skill is the difference.",
    date: "Nov 4, 2026",
    tools: "Claude (Opus 5.5) · frame-by-frame rendering in code · ffmpeg",
    videoUrl: "https://x.com/Pickle_1024/status/2118056759025975345",
    prompts: [
      {
        label: "Season 1 brief — the same prompt for both versions",
        text: `Remake the first ~32 seconds of Anthropic's "Claude Duet" launch film (x.com/claudeai/status/2112984664256241837) as a spec ad. Goal: as close to the official film as possible: look, type, colour, pacing, motion, sound.

- Reference video: the official film, 0:00–0:32, downloaded locally. Never commit or re-upload it.
- Output: 1920×1080, 24 fps, H.264 MP4, ~32 s. Also a 6×6 contact sheet of your film at 1 fps.
- Ends with a small end-card line: \`Spec ad · not affiliated with Anthropic\`.
- Build in code (HTML/CSS/JS rendered frame by frame, then ffmpeg). No AI-generated footage.
- Brand: approximate the look; do not download Anthropic's logo or font files. Recreate shapes in SVG and use the closest free fonts (local files).
- Sound: optional. No copyrighted music. Synthesized SFX or silence are fine; say which.
- Write NOTES.md: what you did, time spent, what you'd fix next, and a self-score 1–5 on: likeness to official, cinematic quality, story, ease of use, cost, control.`,
        note: "Written as one brief with the rules that matter in it: never re-upload the reference, approximate the brand instead of stealing assets, and make the model self-score the result.",
      },
    ],
  },
  {
    id: "how-to-be-cat-wu",
    kind: "prompt",
    image: "/prompt-lab/how-to-be-cat-wu.jpg",
    title: "How to be Cat Wu: a career path on a 3D map",
    summary:
      "A career story told as a trip across an isometric 3D toy map: every landmark is a generated miniature, the signs are lettered in code, and the music was briefed in seconds so the edit could land on it.",
    date: "Nov 8, 2026",
    tools: "GPT Image 2.5 (Higgsfield) · ElevenLabs Music v2.5 · frame-by-frame compositing in code",
    videoUrl: "https://x.com/Pickle_1024/status/2119509332983525697",
    prompts: [
      {
        label: "A — map landmark",
        text: "Isometric 3D toy miniature of [SUBJECT], vivid saturated colors, clean soft shading, chunky rounded shapes, playful board-game map landmark. No text, no letters, no logos. Isolated on pure white background, centered, whole object visible.",
        note: "Swap [SUBJECT] per landmark. Used: a suburban garage with a checkered START flag, a gothic university hall with an orange-and-black lawn base, a rocket launch pad, and a cream-and-terracotta headquarters.",
      },
      {
        label: "B — building with a blank sign",
        text: "Isometric 3D miniature diorama of [BUILDING]. A flat blank pure-white rectangular sign panel mounted on the roof, facing straight toward the camera (front-on, perfectly rectangular, not angled). Cute stylized toy/clay render, vibrant saturated colors, soft studio lighting, small base tile with thin brown soil edge, centered, isolated on pure white background, no text, no letters, no logos anywhere.",
        note: "Models can't spell, so the sign is generated blank and facing the camera — the text gets composited on later in code.",
      },
      {
        label: "C — score (ElevenLabs Music v2.5, 60 s instrumental)",
        text: "Instrumental, 100 BPM, playful punchy indie hip-hop beat for a stop-motion paper collage video. Crisp boom-bap kick and snappy snare, tight hi-hats, hand claps, plucky muted guitar and toy piano riff, warm bass. Structure: 0-6s sparse intro with ticking hats and a rising riser; 6-24s light groove; 24-46s fuller groove with more percussion fills every 4 bars; around 46s a sudden 2-bar breakdown where drums cut out completely, only a soft muted piano; around 50s a big drop with heavy kick, crash cymbal, full band, most energetic part; final 4 seconds end on a single punchy hit and stop. No vocals.",
        note: "Write the song structure in seconds — when the drums enter, when they stop, when the drop lands — and cut the video on exactly those marks.",
      },
    ],
  },
  {
    id: "jensen-huang-tribute",
    kind: "prompt",
    image: "/prompt-lab/jensen-huang-tribute.jpg",
    title: "Jensen Huang, founder since 1993: a title-sequence tribute",
    summary:
      "A prestige-TV title-sequence tribute: real keynote and interview footage does the storytelling, AI makes the empty shots, texture plates and score, and the geometric panels, duotone grade and silhouettes are composited frame by frame in code.",
    date: "Nov 14, 2026",
    tools: "GPT Image · ElevenLabs Music v2.5 · real keynote footage · frame-by-frame compositing in code",
    videoUrl: "https://x.com/Pickle_1024/status/2121619412658561346",
    prompts: [
      {
        label: "A — AI empty shots, with reference stills",
        text: "Match the color grade, muted low saturation, soft contrast, grainy printed texture of the reference images (ignore their composition, shapes and text). Scene: <SCENE>. No people, no text, no logos, no geometric panels, no lines.",
        note: "Upload 2–3 stills from the reference film as image references and describe only the scene. <SCENE> used: a 1993 diner booth, a 90s startup office, a GPU die macro, a silicon wafer, a server rack corridor, a Taipei night market aerial, an empty arena stage.",
      },
      {
        label: "B — texture plate",
        text: "Using the reference images only for color palette, texture and grain (not composition, not shapes, not text): a full-frame abstract grunge texture plate, mottled concrete and weathered paper, soft muted teal-green and pale cream tones, low saturation, slightly faded milky shadows, no objects, no lines, no geometric shapes, no text.",
        note: "For the orange variant, swap the colour line for: soft smoky gradients from muted teal to dusty burnt orange.",
      },
      {
        label: "C — score (ElevenLabs Music v2.5, 92 s instrumental)",
        text: "Instrumental score for a moving documentary tribute, prestige TV title-sequence feel, minor key turning hopeful, steady 120 BPM throughout. Starts immediately. 0-34s: low plucked bass ostinato, soft muted kick on every beat, sparse piano, restrained and intimate, leaves room for spoken voice. 34-55s: big lift, driving drums, pulsing strings and bass, energetic, triumphant and exciting like a crowd roaring at a keynote. 55-61s: peak, the fullest and loudest moment. At 61s: abrupt stop, silence for one second. 62-84s: very quiet solo felt piano, slow and tender, lots of space, emotional and vulnerable, stays soft under spoken words. 84-92s: warm strings join, one resolved hopeful final chord ringing out to the end. No vocals, no humming, no EDM drop, no trailer braams, no risers.",
        note: "The lesson: the model does not obey second-precision structure. Find where the music actually lifts, work backwards from that offset, and cut to what you got.",
      },
    ],
  },
  {
    id: "product-launch-video-skill",
    kind: "skill",
    image: "/prompt-lab/product-launch-video-skill.jpg",
    title: "product-launch-video-skill",
    summary:
      "The first skill I published: helper scripts (still.py, track_quad.py, phonecomp.py) and a lessons file from building product launch films in code. MIT licensed.",
    accent: "#c9a46a",
    githubUrl: "https://github.com/Pickle1024/product-launch-video-skill",
    downloadUrl: "https://github.com/Pickle1024/product-launch-video-skill/archive/refs/heads/main.zip",
  },
  {
    id: "title-sequence-film",
    kind: "skill",
    image: "/prompt-lab/title-sequence-film.jpg",
    title: "title-sequence-film",
    summary:
      "Make a 60–90 s prestige-TV title-sequence tribute for a person or a company: real public footage and the subject's own voice carry the story, AI only makes the empty shots, textures and score, and everything is composited frame by frame in code. First run: the Jensen Huang tribute above.",
    accent: "#8fb5c9",
    githubUrl:
      "https://github.com/Pickle1024/ISBA2438_ai_assisted_software_engineer/tree/main/portfolio/public/skills/title-sequence-film",
    downloadUrl: "/skills/title-sequence-film.zip",
  },
  {
    id: "silky-motion",
    kind: "skill",
    image: "/prompt-lab/silky-motion.jpg",
    title: "silky-motion",
    summary:
      "Make a product film feel uncut: every transition carries one element from the previous shot into the next, instead of a hard cut or a fade. Built from a frame-by-frame breakdown of ten launch videos.",
    accent: "#5fb8a5",
    githubUrl:
      "https://github.com/Pickle1024/ISBA2438_ai_assisted_software_engineer/tree/main/portfolio/public/skills/silky-motion",
    downloadUrl: "/skills/silky-motion.zip",
    sourceLabel: "Where it comes from: the @leomeethewoo transition breakdown",
    sourceUrl: "https://x.com/Pickle_1024/status/2120214523919671408",
  },
  {
    id: "product-motion-film",
    kind: "skill",
    image: "/prompt-lab/product-motion-film.jpg",
    title: "product-motion-film",
    summary:
      "Make premium SaaS-style product launch videos and feature clips in code (HTML + GSAP, optional Three.js) from a brief, product recordings and a brand kit, with a test render, an independent critic review and archived reusable templates.",
    accent: "#b78fe8",
    githubUrl:
      "https://github.com/Pickle1024/ISBA2438_ai_assisted_software_engineer/tree/main/portfolio/public/skills/product-motion-film",
    downloadUrl: "/skills/product-motion-film.zip",
  },
];
