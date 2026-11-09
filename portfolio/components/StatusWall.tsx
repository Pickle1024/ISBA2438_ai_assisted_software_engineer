"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { label: "READ MEMORY", start: 0 },
  { label: "FIND ROLES", start: 1.5 },
  { label: "READ EACH JD", start: 3.6 },
  { label: "TAILOR RÉSUMÉS", start: 5.8 },
  { label: "DRAFT NOTES", start: 8.1 },
  { label: "MY FINAL CALL", start: 9.8 },
  { label: "WRITE BACK", start: 11.7 },
];

const LOOP_SECONDS = 15;
const SETTLED_TIME = 13.5;

const WHITE = "#f1eee7";
const GREY = "#8b8d8a";
const DIM = "#3a3b39";
const BLACK = "#0c0c0c";
const ACCENT = "#9cc9bd";

const FILES = ["PROFILE", "CRITERIA", "DECISIONS", "NOTES"];
const ROLES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SHORTLIST = [1, 4, 6];
const NOTE_LANGUAGES = ["EN", "中", "EN"];
const CHOICES = ["PICK", "REVIEW", "SEND"];

const ROLE_X = 420;
const ROLE_W = 230;
const roleY = (index: number) => 120 + index * 64;

const PAGE_X = 800;
const PAGE_W = 180;
const PAGE_H = 160;
const pageY = (index: number) => 120 + index * 190;

const NOTE_X = 1050;
const NOTE_W = 160;
const NOTE_H = 100;
const noteY = (index: number) => pageY(index) + 30;

const CALL = { x: 1410, y: 320, r: 96 };
const WRITE_BACK = [
  [1410, 660],
  [1410, 730],
  [185, 730],
  [185, 468],
];

/** How far through the window from `start` to `end` the clock is, from 0 to 1. */
function progress(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

function pointAlong(points: number[][], amount: number): [number, number] {
  const lengths = points.slice(1).map(([x, y], i) => Math.abs(x - points[i][0]) + Math.abs(y - points[i][1]));
  let remaining = amount * lengths.reduce((sum, length) => sum + length, 0);
  for (let i = 0; i < lengths.length; i += 1) {
    if (remaining <= lengths[i]) {
      const ratio = remaining / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * ratio,
        points[i][1] + (points[i + 1][1] - points[i][1]) * ratio,
      ];
    }
    remaining -= lengths[i];
  }
  const [x, y] = points[points.length - 1];
  return [x, y];
}

function DrawnLine({ d, amount }: { d: string; amount: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={GREY}
      strokeWidth="1.5"
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={1 - amount}
    />
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fill={GREY} fontSize="19" letterSpacing="3">
      {children}
    </text>
  );
}

export default function StatusWall({ label }: { label: string }) {
  const [time, setTime] = useState(SETTLED_TIME);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !svgRef.current) return;

    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      startedAt ??= now;
      setTime(((now - startedAt) / 1000) % LOOP_SECONDS);
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) frame = requestAnimationFrame(tick);
    });
    observer.observe(svgRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const activeStage = STAGES.reduce((active, stage, index) => (time >= stage.start ? index : active), 0);
  const writeBack = progress(time, 11.8, 13);
  const [pulseX, pulseY] = pointAlong(WRITE_BACK, writeBack);
  const decisionsFlash = time > 12.9 && time < 13.8;
  const loopFade = Math.min(progress(time, 0, 0.3), 1 - progress(time, 14.6, 15));
  const callOn = progress(time, 10.4, 10.9);

  return (
    <svg ref={svgRef} className="status-wall film-frame-media" viewBox="0 0 1600 900" role="img" aria-label={label}>
      <g opacity={time === SETTLED_TIME ? 1 : loopFade}>
        <Label x={60} y={100}>SHARED MEMORY</Label>
        {FILES.map((file, index) => {
          const y = 120 + index * 86;
          const flash = file === "DECISIONS" && decisionsFlash;
          return (
            <g key={file} opacity={progress(time, 0.2 + index * 0.25, 0.6 + index * 0.25)}>
              <rect x={60} y={y} width={250} height={72} rx="5" fill={flash ? WHITE : "#141413"} stroke={GREY} />
              <text x={84} y={y + 44} fill={flash ? BLACK : WHITE} fontSize="21" letterSpacing="2">
                {file}
              </text>
            </g>
          );
        })}

        {[0, 1, 2, 3].map((index) => {
          const amount = progress(time, 1.5 + index * 0.25, 2.3 + index * 0.25);
          if (amount === 0 || amount === 1) return null;
          return <rect key={index} x={310 + amount * 100} y={200 + index * 70} width="10" height="10" fill={WHITE} />;
        })}

        <Label x={ROLE_X} y={100}>OPEN ROLES</Label>
        {ROLES.map((role, index) => {
          const scanAt = 3.7 + index * 0.25;
          const scanning = time >= scanAt && time < scanAt + 0.25;
          const read = time >= scanAt + 0.25;
          const kept = SHORTLIST.includes(index);
          const y = roleY(index);
          return (
            <g key={role} opacity={progress(time, 1.7 + index * 0.2, 2 + index * 0.2) * (read && !kept ? 0.42 : 1)}>
              <rect
                x={ROLE_X}
                y={y}
                width={ROLE_W}
                height={52}
                rx="5"
                fill={scanning ? WHITE : "#141413"}
                stroke={read && kept ? WHITE : DIM}
              />
              <text x={ROLE_X + 20} y={y + 33} fill={scanning ? BLACK : WHITE} fontSize="20" letterSpacing="2">
                ROLE {role}
              </text>
              {read && (
                <text
                  x={ROLE_X + ROLE_W - 18}
                  y={y + 32}
                  fill={kept ? ACCENT : GREY}
                  fontSize="16"
                  letterSpacing="1.5"
                  textAnchor="end"
                >
                  {kept ? "KEEP ✓" : "SKIP + WHY"}
                </text>
              )}
            </g>
          );
        })}

        <Label x={PAGE_X} y={100}>RÉSUMÉS</Label>
        {SHORTLIST.map((role, index) => {
          const start = 5.9 + index * 0.65;
          const y = pageY(index);
          const fromY = roleY(role) + 26;
          const toY = y + PAGE_H / 2;
          const midX = (ROLE_X + ROLE_W + PAGE_X) / 2;
          return (
            <g key={role}>
              <DrawnLine
                d={`M ${ROLE_X + ROLE_W} ${fromY} H ${midX} V ${toY} H ${PAGE_X}`}
                amount={progress(time, start, start + 0.4)}
              />
              <g opacity={progress(time, start + 0.3, start + 0.5)}>
                <rect x={PAGE_X} y={y} width={PAGE_W} height={PAGE_H} rx="3" fill={WHITE} />
                {[0.8, 0.62, 0.72, 0.5].map((width, line) => (
                  <rect
                    key={line}
                    x={PAGE_X + 18}
                    y={y + 22 + line * 20}
                    width={(PAGE_W - 36) * width * progress(time, start + 0.4 + line * 0.08, start + 0.7 + line * 0.08)}
                    height="7"
                    fill="#9a9a94"
                  />
                ))}
                <text
                  x={PAGE_X + 18}
                  y={y + 132}
                  fill={BLACK}
                  fontSize="15"
                  letterSpacing="1"
                  opacity={progress(time, start + 0.8, start + 1)}
                >
                  1 PAGE ✓ LINKS ✓
                </text>
              </g>
            </g>
          );
        })}

        <Label x={NOTE_X} y={100}>REFERRAL NOTES</Label>
        {NOTE_LANGUAGES.map((language, index) => {
          const start = 8.2 + index * 0.4;
          const y = noteY(index);
          const middle = y + NOTE_H / 2;
          return (
            <g key={index}>
              <DrawnLine d={`M ${PAGE_X + PAGE_W} ${middle} H ${NOTE_X}`} amount={progress(time, start, start + 0.3)} />
              <g opacity={progress(time, start + 0.2, start + 0.45)}>
                <rect x={NOTE_X} y={y} width={NOTE_W} height={NOTE_H} rx="5" fill="#141413" stroke={GREY} />
                <text x={NOTE_X + 18} y={y + 38} fill={WHITE} fontSize="20" letterSpacing="2">
                  {language}
                </text>
                <rect x={NOTE_X + 18} y={y + 56} width={NOTE_W - 36} height="5" fill={DIM} />
                <rect x={NOTE_X + 18} y={y + 72} width={(NOTE_W - 36) * 0.65} height="5" fill={DIM} />
              </g>
              <DrawnLine
                d={`M ${NOTE_X + NOTE_W} ${middle} H ${NOTE_X + NOTE_W + 48} V ${CALL.y} H ${CALL.x - CALL.r}`}
                amount={progress(time, 9.9 + index * 0.12, 10.5 + index * 0.12)}
              />
            </g>
          );
        })}

        <g opacity={0.2 + 0.8 * callOn}>
          <circle cx={CALL.x} cy={CALL.y} r={CALL.r} fill={callOn > 0.5 ? WHITE : "#141413"} stroke={GREY} />
          <text x={CALL.x} y={CALL.y - 2} fill={callOn > 0.5 ? BLACK : WHITE} fontSize="40" textAnchor="middle">
            ME
          </text>
          <text
            x={CALL.x}
            y={CALL.y + 32}
            fill={callOn > 0.5 ? BLACK : WHITE}
            fontSize="16"
            letterSpacing="2"
            textAnchor="middle"
          >
            FINAL CALL
          </text>
        </g>

        {CHOICES.map((choice, index) => {
          const y = 452 + index * 64;
          const on = time >= 10.9 + index * 0.25;
          return (
            <g key={choice} opacity={progress(time, 10.7 + index * 0.25, 10.95 + index * 0.25)}>
              <rect x={CALL.x - 86} y={y} width={172} height={50} rx="25" fill="none" stroke={on ? ACCENT : DIM} />
              <text x={CALL.x} y={y + 32} fill={on ? ACCENT : GREY} fontSize="18" letterSpacing="2" textAnchor="middle">
                {choice} ✓
              </text>
            </g>
          );
        })}

        <path
          d={`M ${WRITE_BACK.map(([x, y]) => `${x} ${y}`).join(" L ")}`}
          fill="none"
          stroke={time >= 11.8 ? GREY : DIM}
          strokeWidth="1.5"
          strokeDasharray="7 7"
        />
        {writeBack > 0 && writeBack < 1 && <circle cx={pulseX} cy={pulseY} r="9" fill={WHITE} />}
        <text x={800} y={716} fill={time >= 11.8 ? WHITE : DIM} fontSize="17" letterSpacing="3" textAnchor="middle">
          DECISIONS WRITTEN BACK
        </text>

        {STAGES.map((stage, index) => {
          const x = 44 + index * 216;
          const active = index === activeStage;
          const past = index < activeStage;
          return (
            <g key={stage.label}>
              <rect x={x} y={796} width={200} height="1" fill={DIM} />
              <rect x={x} y={795} width={active ? 200 : past ? 40 : 0} height="3" fill={active ? WHITE : GREY} />
              <text
                x={x}
                y={826}
                fill={active ? WHITE : past ? GREY : DIM}
                fontSize="16"
                letterSpacing="1.5"
              >
                {`0${index + 1}  ${stage.label}`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
