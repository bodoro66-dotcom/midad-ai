export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "طريقة الطلب غير مدعومة." }, { status: 405 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({
      error: "لم يُضف مفتاح OPENAI_API_KEY إلى إعدادات Netlify بعد."
    }, { status: 503 });
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
    const data = await upstream.json();
    if (!upstream.ok) {
      const msg = data?.error?.message || "تعذر على خدمة الذكاء الاصطناعي إكمال الطلب.";
      return Response.json({ error: msg }, { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 });
    }
    let activity = data.output_text || "";
    if (!activity && Array.isArray(data.output)) {
      activity = data.output.flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text || "").join("\n");
    }
    if (!activity) {
      return Response.json({ error: "لم يصل نص النشاط من خدمة الذكاء الاصطناعي." }, { status: 502 });
    }
    return Response.json({ activity });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء إعداد النشاط. أعيدي المحاولة بعد قليل." }, { status: 500 });
  }
};
