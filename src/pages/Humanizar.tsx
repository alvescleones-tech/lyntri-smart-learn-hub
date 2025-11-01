import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MobileNav from "@/components/MobileNav";

const Humanizar = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emocional, setEmocional] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleHumanize = async () => {
    if (!input.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite o texto que deseja humanizar",
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
                content: `Reescreva o texto abaixo de forma mais natural e humana, mantendo o mesmo significado${
                  emocional ? " e usando um tom mais emocional e empático" : ""
                }. 
                Corrija frases repetitivas, expressões mecânicas e termos artificiais.
                
Texto original:
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
        throw new Error("Erro ao humanizar texto");
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

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-gradient-to-br from-[hsl(170,60%,50%)] to-[hsl(150,55%,45%)] text-white px-4 py-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Humanizar Texto</h1>
            <p className="text-sm text-white/90">Deixe seu texto mais natural</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cole o texto que deseja humanizar:
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole aqui o texto que você quer deixar mais natural..."
              className="min-h-[150px]"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="emocional"
              checked={emocional}
              onCheckedChange={setEmocional}
              disabled={isLoading}
            />
            <Label htmlFor="emocional" className="text-sm">
              Modo emocional (tom mais empático)
            </Label>
          </div>

          <Button
            onClick={handleHumanize}
            disabled={isLoading || !input.trim()}
            className="w-full bg-gradient-to-r from-[hsl(170,60%,50%)] to-[hsl(150,55%,45%)] hover:opacity-90"
          >
            {isLoading ? (
              <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Humanizando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Humanizar Texto</>
            )}
          </Button>
        </Card>

        {result && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Texto Humanizado:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground bg-muted/50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default Humanizar;