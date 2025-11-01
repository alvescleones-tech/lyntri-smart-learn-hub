import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MobileNav from "@/components/MobileNav";

const Estudos = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite um tema ou conteúdo para estudar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Crie um material de estudos completo sobre: ${input}. 
                Inclua: resumo, pontos principais, explicação detalhada e exemplos práticos.`,
              },
            ],
          }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 429) {
          throw new Error("Limite excedido. Tente mais tarde.");
        }
        throw new Error("Erro ao gerar material");
      }

      if (!resp.body) throw new Error("Sem resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setResult(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-gradient-to-br from-[hsl(260,70%,55%)] to-[hsl(230,60%,50%)] text-white px-4 py-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Estudos</h1>
            <p className="text-sm text-white/90">Crie materiais de aprendizado</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Digite o tema ou conteúdo que você quer estudar:
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Fotossíntese, Segunda Guerra Mundial, Equações de segundo grau..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="w-full bg-gradient-to-r from-[hsl(260,70%,55%)] to-[hsl(230,60%,50%)] hover:opacity-90"
          >
            {isLoading ? (
              <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Gerar Material</>
            )}
          </Button>
        </Card>

        {result && (
          <Card className="p-4">
            <h3 className="font-bold mb-3 text-lg">Material de Estudos:</h3>
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Estudos;