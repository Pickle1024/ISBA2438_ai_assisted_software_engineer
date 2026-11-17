import type { Metadata } from "next";

import PromptLabBoard from "@/components/PromptLabBoard";
import { labCards } from "@/data/promptLab";

export const metadata: Metadata = { title: "Prompt Lab" };

export default function PromptLabPage() {
  return (
    <div className="page">
      <p className="eyebrow">Prompt Lab</p>
      <h1>Prompts and skills behind my videos</h1>
      <p className="lede">
        Every prompt I ran to make the videos on my timeline, and the skills I
        built from that work. Read them, steal them, make something better.
      </p>
      <PromptLabBoard cards={labCards} />
    </div>
  );
}
