
import React from 'react';
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="w-full py-4 px-6 border-b border-iso-purple/20 bg-iso-dark/80 backdrop-blur-md z-10 sticky top-0">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-iso-purple to-iso-blue flex items-center justify-center animate-pulse-glow">
              <span className="text-white font-bold">ISO</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-iso-purple to-iso-blue bg-clip-text text-transparent">
              ISO Guardian
            </h1>
            <p className="text-xs text-muted-foreground">Assistente de Conformidade ISO/IEC 27001</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-6">
          <NavLink href="#" active>Início</NavLink>
          <NavLink href="#">Sobre</NavLink>
          <NavLink href="#">Recursos</NavLink>
          <NavLink href="#">Contato</NavLink>
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

function NavLink({ href, children, active, className, ...props }: NavLinkProps) {
  return (
    <a 
      href={href} 
      className={cn(
        "text-sm font-medium transition-colors hover:text-iso-purple relative",
        active ? "text-iso-purple after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-iso-purple" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
