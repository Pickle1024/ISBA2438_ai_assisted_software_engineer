// One log line per API call: [scope] METHOD /path STATUS — detail.
export function logApiCall(
  scope: string,
  method: string,
  path: string,
  status: number,
  detail?: string,
): void {
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`[${scope}] ${method} ${path} ${status}${suffix}`);
}
