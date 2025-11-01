import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageCircle, Sparkles, Search, LogOut, Sparkles as SparklesIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import MobileNav from "@/components/MobileNav";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const features = [
    {
      title: "Estudos",
      description: "Crie resumos, explicações e materiais de aprendizado",
      icon: BookOpen,
      gradient: "from-[hsl(260,70%,55%)] to-[hsl(230,60%,50%)]",
      path: "/estudos",
    },
    {
      title: "IA Chat",
      description: "Converse com a IA para tirar dúvidas e aprender",
      icon: MessageCircle,
      gradient: "from-[hsl(260,70%,55%)] to-[hsl(280,65%,60%)]",
      path: "/chat",
    },
    {
      title: "Humanizar",
      description: "Transforme textos artificiais em conteúdo natural",
      icon: Sparkles,
      gradient: "from-[hsl(170,60%,50%)] to-[hsl(150,55%,45%)]",
      path: "/humanizar",
    },
    {
      title: "Verificar IA",
      description: "Detecte se um texto foi gerado por inteligência artificial",
      icon: Search,
      gradient: "from-[hsl(25,75%,55%)] to-[hsl(10,70%,50%)]",
      path: "/verificar",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 pb-24">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Lyntri.ia
              </h1>
              <p className="text-xs text-muted-foreground">Sua assistente de IA</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Bem-vindo à Lyntri.ia
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha uma das funcionalidades abaixo para começar a usar sua assistente de IA
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
