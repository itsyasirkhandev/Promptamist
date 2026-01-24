import Link from "next/link";
import { Bot, Github, Linkedin } from "lucide-react";

const NAV_LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#features', label: 'Features' },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Promptamist</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
                The personal command center for your AI prompts. Stop repeating yourself.
            </p>
          </div>
          
          <nav className="flex gap-8 text-sm font-medium">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="https://www.linkedin.com/in/connectyasir" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
            </Link>
             <Link href="https://github.com/itsyasirkhandev/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
             <p>© {new Date().getFullYear()} Promptamist. All rights reserved.</p>
             <p>
              Made with ❤️ by{' '}
              <Link href="https://yasir.qzz.io" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary transition-colors">
                Yasir
              </Link>
            </p>
        </div>
      </div>
    </footer>
  );
}
