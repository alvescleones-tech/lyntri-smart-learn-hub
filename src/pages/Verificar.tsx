import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Search, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import MobileNav from "@/components/MobileNav";

const Verificar = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [percentage, setPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!input.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite o texto que deseja verificar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");
    setPercentage(null);

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
                content: `Analise se o texto abaixo foi gerado por IA.

IMPORTANTE: Comece sua resposta SEMPRE com a porcentagem entre 0 e 100 seguida de %. Exemplo: "75%"

Depois explique:
1. A probabilidade (em %) de ser IA
2. Sinais que indicam texto de IA (repetições, perfeição artificial, falta de erros naturais)
3. Sugestões para deixar mais humano (se aplicável)

Texto para analisar:
${input}`,
              },
            ],
          }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 429) {
          throw new Error("Limite excedido. Tente mais tarde.");
        }
        throw new Error("Erro ao verificar texto");
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

              // Extract percentage from response
              const match = assistantContent.match(/(\d+)%/);
              if (match && percentage === null) {
                setPercentage(parseInt(match[1]));
              }
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

  const getStatusIcon = () => {
    if (percentage === null) return null;
    if (percentage >= 70) return <AlertCircle className="h-6 w-6 text-destructive" />;
    if (percentage >= 40) return <Info className="h-6 w-6 text-accent" />;
    return <CheckCircle className="h-6 w-6 text-secondary" />;
  };

  const getStatusColor = () => {
    if (percentage === null) return "";
    if (percentage >= 70) return "text-destructive";
    if (percentage >= 40) return "text-accent";
    return "text-secondary";
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-gradient-to-br from-[hsl(25,75%,55%)] to-[hsl(10,70%,50%)] text-white px-4 py-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Verificar IA</h1>
            <p className="text-sm text-white/90">Detecte textos gerados por IA</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cole o texto que deseja verificar:
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole aqui o texto que você quer verificar se foi gerado por IA..."
              className="min-h-[150px]"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isLoading || !input.trim()}
            className="w-full bg-gradient-to-r from-[hsl(25,75%,55%)] to-[hsl(10,70%,50%)] hover:opacity-90"
          >
            {isLoading ? (
              <><Search className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Verificar Texto</>
            )}
          </Button>
        </Card>

        {percentage !== null && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className="font-bold text-lg">Resultado da Análise</h3>
                <p className={`text-2xl font-bold ${getStatusColor()}`}>
                  {percentage}% probabilidade de IA
                </p>
              </div>
            </div>
            <Progress value={percentage} className="mb-4" />
          </Card>
        )}

        {result && (
          <Card className="p-4">
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

export default Verificar;