
import Link from "next/link";
import { Bot } from "lucide-react";

const NAV_LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#features', label: 'Features' },
];

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold">Promptamist</span>
          </div>
          <nav className="flex gap-6 text-sm">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Promptamist. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made by{' '}
              <Link href="https://yasir.qzz.io" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
                Yasir
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
