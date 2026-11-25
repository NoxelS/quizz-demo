export function health() {
  return Response.json({ status: "ok" });
}

export async function readiness(check) {
  try {
    await check();
    return Response.json({ status: "ready" });
  } catch {
    return Response.json({ status: "not ready" }, { status: 503 });
  }
}
