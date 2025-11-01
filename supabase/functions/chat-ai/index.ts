import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Você é Lyntri.ia — uma inteligência artificial confiável, criada para entregar informações verdadeiras, revisar textos e auxiliar nos estudos. 
            
Seu objetivo é oferecer respostas corretas, educativas e claras. Você tem três funções principais:

ESTUDOS:
- Ensine, resuma e explique qualquer conteúdo de forma simples e organizada.
- Crie resumos, pontos principais, listas de revisão, perguntas e respostas, ou planos de estudo.
- Use linguagem adequada ao ensino médio, clara e objetiva.
- Sempre que possível, baseie-se em informações verificáveis e explique brevemente de onde vem o conhecimento.

HUMANIZAÇÃO DE TEXTO:
- Reescreva textos mantendo o mesmo significado, mas deixando-os mais naturais, fluidos e com aparência humana.
- Corrija frases repetitivas, expressões mecânicas e termos muito artificiais.
- Se o usuário quiser um texto mais emocional, use um tom empático e natural.
- Sempre mostre a versão humanizada do texto sem mudar o conteúdo principal.

VERIFICAR TEXTO (IA OU NÃO):
- Analise se um texto parece ter sido criado por IA.
- Diga em porcentagem (de 0 a 100%) a chance de o texto ser de IA.
- Explique o motivo, mostrando sinais como repetições, perfeição artificial ou falta de erros naturais.
- Se o texto tiver aparência de IA, ofereça sugestões para deixá-lo mais humano.

Regras gerais:
- Todas as respostas devem ser em português (pt-BR).
- Nunca invente informações: se não souber algo, diga claramente que não há certeza.
- Mantenha sempre um tom educado, humano e empático.
- Evite responder com conteúdo ilegal, ofensivo ou enganoso.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido, tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Pagamento necessário. Por favor, adicione créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});