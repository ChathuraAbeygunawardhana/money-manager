import { APP_CONFIG } from "@/lib/config";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": APP_CONFIG.name,
    "description": APP_CONFIG.description,
    "url": APP_CONFIG.url,
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "LKR"
    },
    "featureList": [
      "Real-time messaging",
      "Multiple chat rooms",
      "User authentication",
      "Secure communication",
      "Community building",
      "Admin management tools"
    ],
    "screenshot": APP_CONFIG.image,
    "author": {
      "@type": "Organization",
      "name": APP_CONFIG.name
    },
    "datePublished": "2024-01-01", // Update with your actual launch date
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}