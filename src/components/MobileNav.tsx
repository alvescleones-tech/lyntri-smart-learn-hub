import { Home, BookOpen, MessageCircle, Sparkles, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/estudos", icon: BookOpen, label: "Estudos" },
    { to: "/chat", icon: MessageCircle, label: "IA Chat" },
    { to: "/humanizar", icon: Sparkles, label: "Humanizar" },
    { to: "/verificar", icon: Search, label: "Verificar" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;