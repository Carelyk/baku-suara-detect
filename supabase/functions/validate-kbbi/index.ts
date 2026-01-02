import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Validating text:", text);

    const systemPrompt = `Kamu adalah validator Bahasa Indonesia Baku berdasarkan KBBI (Kamus Besar Bahasa Indonesia).

TUGAS PERTAMA (WAJIB): Tentukan apakah teks yang diberikan mayoritas adalah Bahasa Indonesia.
- Jika teks mayoritas BUKAN Bahasa Indonesia (misalnya Inggris/asing), JANGAN lakukan koreksi KBBI.
- Dalam kasus non-Indonesia, kembalikan JSON:
  { "isValid": true, "errors": [], "language": "non-id" }

Jika teks adalah Bahasa Indonesia, lakukan deteksi kata-kata yang TIDAK BAKU, termasuk:
1. Kata slang/gaul (contoh: gue, lu, gak, udah, gimana, dll)
2. Kata dari bahasa daerah yang bukan Bahasa Indonesia baku
3. Singkatan tidak resmi (contoh: yg, dgn, krn, dll)
4. Partikel informal (contoh: dong, sih, deh, nih, dll)

PENTING: Hanya tandai kata yang benar-benar tidak baku. Jangan tandai kata baku yang valid.

Berikan respons dalam format JSON dengan struktur:
{
  "isValid": boolean,
  "errors": [
    { "wrong": "kata tidak baku", "correct": "kata baku yang benar" }
  ],
  "language": "id" | "non-id"
}

Jika semua kata sudah baku, kembalikan:
{ "isValid": true, "errors": [], "language": "id" }

Jika ada kata tidak baku, kembalikan contoh koreksinya.
Jika kata harus dihindari tanpa pengganti (seperti partikel "dong", "sih"), gunakan "(hindari penggunaan kata ini)" sebagai koreksi.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analisis teks berikut: "${text}"` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits" }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI validation failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log("AI response:", content);

    // Parse JSON from AI response
    let result: { isValid: boolean; errors: any[]; language?: string } = { isValid: true, errors: [], language: "id" };
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: assume valid if we can't parse
    }

    // Normalize/validate language output
    if (result.language !== "id" && result.language !== "non-id") {
      result.language = "id";
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("validate-kbbi error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
