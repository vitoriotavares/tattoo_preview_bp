import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo/Brand */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">TattooPreview</h3>
            <p className="text-xs leading-relaxed">
              Visualize tatuagens com inteligência artificial. 
              Adicione, remova ou retoque tatuagens em suas fotos com resultados fotorrealistas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/policy" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Suporte</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="mailto:support@tattoopreview.app" 
                  className="hover:text-foreground transition-colors"
                >
                  support@tattoopreview.app
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs">
            © {new Date().getFullYear()} TattooPreview. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
