export function SeoSchema() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TattooPreview",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Simulador de tatuagem com IA que permite testar como tatuagens ficariam em você antes de fazer. Resultado fotorrealista em poucos segundos.",
    "url": "https://tattoopreview.com",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "description": "3 testes gratuitos"
    },
    "featureList": [
      "Simulação fotorrealista de tatuagem",
      "IA Google Nano Banana",
      "Resultado em poucos segundos",
      "3 testes gratuitos",
      "Sem necessidade de cadastro",
      "Suporte a todos os estilos de tatuagem",
      "Download do resultado"
    ],
    "screenshot": "https://tattoopreview.com/images/app-screenshot.jpg",
    "author": {
      "@type": "Organization",
      "name": "TattooPreview"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TattooPreview",
    "url": "https://tattoopreview.com",
    "description": "Plataforma líder em simulação virtual de tatuagem com inteligência artificial.",
    "sameAs": [
      "https://instagram.com/tattoopreview",
      "https://tiktok.com/@tattoopreview"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": "https://tattoopreview.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Simulador",
        "item": "https://tattoopreview.com/tattoo"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  );
}