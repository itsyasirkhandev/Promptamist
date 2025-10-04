
import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold">Promptamist</span>
          </div>
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
    </footer>
  );
}
