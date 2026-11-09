const COLUMNS = [
  {
    name: "CAREER",
    x: 90,
    rows: [
      { name: "Finding roles", status: "shortlist ready ✓" },
      { name: "Tailored résumés", status: "ready for review ✓" },
      { name: "Referral outreach", status: "ready to send ✓" },
      { name: "One review page", status: "ready for review ✓" },
    ],
  },
  {
    name: "LIFE",
    x: 830,
    rows: [
      { name: "Memory", status: "written back ✓" },
      { name: "Keeping things tidy", status: "ready to review ✓" },
      { name: "Building this site", status: "preview checked ✓" },
    ],
  },
];

const COLUMN_WIDTH = 680;
const ROW_HEIGHT = 124;
const ROW_GAP = 12;
const TOP = 110;
const LINE = "#3c4744";
const ACCENT = "#9cc9bd";
const NODE = { x: 800, y: 800 };

export default function StatusWall({ label }: { label: string }) {
  return (
    <svg className="status-wall film-frame-media" viewBox="0 0 1600 900" role="img" aria-label={label}>
      {COLUMNS.map((column) => (
        <g key={column.name}>
          <text x={column.x} y={78} fill={ACCENT} fontSize="28" letterSpacing="5">
            {column.name}
          </text>
          {column.rows.map((row, index) => {
            const y = TOP + index * (ROW_HEIGHT + ROW_GAP);
            return (
              <g key={row.name}>
                <rect x={column.x} y={y} width={COLUMN_WIDTH} height={ROW_HEIGHT} rx="8" fill="#131614" stroke={LINE} />
                <text x={column.x + 30} y={y + 54} fill="#f1eee7" fontSize="36">
                  {row.name}
                </text>
                <text x={column.x + 30} y={y + 98} fill="#9aa39f" fontSize="26">
                  {row.status}
                </text>
                {[0, 1, 2].map((segment) => (
                  <rect
                    key={segment}
                    x={column.x + COLUMN_WIDTH - 164 + segment * 46}
                    y={y + 56}
                    width="38"
                    height="8"
                    rx="2"
                    fill={ACCENT}
                  />
                ))}
              </g>
            );
          })}
          <path
            d={`M ${column.x + COLUMN_WIDTH / 2} ${TOP + column.rows.length * (ROW_HEIGHT + ROW_GAP)} V ${NODE.y} H ${NODE.x}`}
            fill="none"
            stroke={LINE}
            strokeWidth="2"
          />
        </g>
      ))}
      <rect x={NODE.x - 170} y={NODE.y - 38} width="340" height="76" rx="38" fill={ACCENT} />
      <text x={NODE.x} y={NODE.y + 10} fill="#0d0f0e" fontSize="28" letterSpacing="3" textAnchor="middle">
        ME · FINAL CALL
      </text>
    </svg>
  );
}
