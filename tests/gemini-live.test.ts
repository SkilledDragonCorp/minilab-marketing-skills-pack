import { describe, expect, test } from "bun:test";

const live =
  process.env.MARKETING_SKILLS_LIVE_GEMINI === "1" &&
  Boolean(process.env.GEMINI_API_KEY?.trim());

describe("optional GEMINI live slice", () => {
  test.skipIf(!live)("calls Generative Language API (smoke)", async () => {
    const key = process.env.GEMINI_API_KEY!;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with exactly: ok" }] }],
        }),
      },
    );
    expect(res.ok).toBe(true);
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    expect(text.toLowerCase()).toContain("ok");
  });
});
