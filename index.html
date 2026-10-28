export default async (request, context) => {
  const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (request.method !== "POST") return json({ error: "طريقة الطلب غير مدعومة." }, 405);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "مفتاح الخدمة غير متاح للدالة. سيظهر النشاط الاحتياطي؛ راجعي إعدادات البيئة لاحقًا." }, 503);
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 12000) return json({ error: "الطلب فارغ أو أطول من الحد المسموح." }, 400);
    let upstream;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-6-luna", reasoning: { effort: "none" }, input: prompt, max_output_tokens: 1000 }),
        signal: AbortSignal.timeout(17000)
      });
    } catch (err) {
      const timedOut = err?.name === "TimeoutError" || err?.name === "AbortError";
      console.error("midad-ai upstream failure", timedOut ? "timeout" : (err?.name || "network"));
      return json({ error: timedOut ? "تأخر رد خدمة الذكاء الاصطناعي. استخدمي النشاط الاحتياطي الآن، ثم أعيدي المحاولة لاحقًا." : "تعذر الاتصال بخدمة الذكاء الاصطناعي. استخدمي النشاط الاحتياطي الآن." }, 504);
    }
    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { return json({ error: `استجابة غير متوقعة من الخدمة (HTTP ${upstream.status}).` }, 502); }
    if (!upstream.ok) {
      const status = upstream.status;
      console.error("midad-ai API status", status, "type", data?.error?.type || "unknown");
      let message = status === 401 ? "مفتاح API غير صالح أو غير مقروء." : status === 403 ? "صلاحية حساب API أو النموذج غير كافية." : status === 429 ? "تجاوز الحساب حد الاستخدام أو يحتاج إلى رصيد API." : `تعذر التوليد (HTTP ${status}).`;
      return json({ error: message }, status >= 400 && status < 600 ? status : 502);
    }
    let activity = typeof data.output_text === "string" ? data.output_text.trim() : "";
    if (!activity && Array.isArray(data.output)) activity = data.output.flatMap(x => Array.isArray(x.content) ? x.content : []).filter(x => x.type === "output_text").map(x => x.text || "").join("\n").trim();
    if (!activity) return json({ error: "وصل رد الخدمة دون محتوى نشاط." }, 502);
    return json({ activity, model: "gpt-6-luna" });
  } catch (err) {
    console.error("midad-ai request error", err?.name || "unknown");
    return json({ error: "تعذر تجهيز الطلب. استخدمي النشاط الاحتياطي الآن." }, 500);
  }
};
