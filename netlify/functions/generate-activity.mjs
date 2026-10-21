export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "طريقة الطلب غير مدعومة. استخدمي زر توليد النشاط داخل الموقع." }, { status: 405 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("generate-activity: OPENAI_API_KEY is missing");
    return Response.json({ error: "مفتاح OPENAI_API_KEY غير متاح للدالة. تحققي من متغيرات البيئة ثم أعيدي النشر." }, { status: 503 });
  }
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt || prompt.length > 18000) {
      return Response.json({ error: "الطلب فارغ أو أطول من الحد المسموح." }, { status: 400 });
    }
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-6-astra",
        input: prompt,
        max_output_tokens: 2400
      })
    });
    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseError) {
      console.error("generate-activity: OpenAI returned non-JSON response; status", upstream.status);
      return Response.json({ error: "خدمة الذكاء الاصطناعي أعادت استجابة غير متوقعة (HTTP " + upstream.status + "). تحققي من اتصال الخدمة ثم أعيدي المحاولة." }, { status: 502 });
    }
    if (!upstream.ok) {
      const msg = data?.error?.message || "تعذر على خدمة الذكاء الاصطناعي إكمال الطلب.";
      console.error("generate-activity: OpenAI API error", upstream.status, data?.error?.code || data?.error?.type || "unknown");
      return Response.json({ error: msg }, { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 });
    }
    let activity = data.output_text || "";
    if (!activity && Array.isArray(data.output)) {
      activity = data.output.flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text || "").join("\n");
    }
    if (!activity) {
      console.error("generate-activity: API response did not contain output text");
      return Response.json({ error: "لم يصل نص النشاط من خدمة الذكاء الاصطناعي." }, { status: 502 });
    }
    return Response.json({ activity });
  } catch (error) {
    console.error("generate-activity: unexpected error", error?.message || "unknown");
    return Response.json({ error: "تعذر إعداد النشاط بسبب خطأ في الاتصال أو المعالجة. افتحي سجل الدالة لمعرفة التفاصيل." }, { status: 500 });
  }
};
