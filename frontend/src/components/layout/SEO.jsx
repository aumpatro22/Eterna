import { useEffect } from 'react';

export default function SEO({ title, description, keywords, canonicalUrl, ogType, ogImage, jsonLd }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    } else {
      document.title = 'Eterna – Preserve Family Memories Forever';
    }

    // Helper to create or update meta tags
    const updateMetaTag = (name, property, content) => {
      if (content === undefined || content === null) return;
      let el = name 
        ? document.querySelector(`meta[name="${name}"]`)
        : document.querySelector(`meta[property="${property}"]`);
      
      if (!el) {
        el = document.createElement('meta');
        if (name) el.setAttribute('name', name);
        if (property) el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    updateMetaTag('description', null, description || 'Eterna helps families preserve memories, stories, photos, and voices forever.');
    if (keywords) {
      updateMetaTag('keywords', null, keywords);
    } else {
      updateMetaTag('keywords', null, 'memory, legacy, memorials, heritage, family timeline, scrapbooking, remembrance');
    }

    // 3. Canonical URL
    const canonicalLinkHref = canonicalUrl || `https://eterna-five-phi.vercel.app${window.location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalLinkHref);

    // 4. Open Graph Tags
    updateMetaTag(null, 'og:title', title || 'Eterna – Preserve Family Memories Forever');
    updateMetaTag(null, 'og:description', description || 'Eterna helps families preserve memories, stories, photos, and voices forever.');
    updateMetaTag(null, 'og:type', ogType || 'website');
    updateMetaTag(null, 'og:image', ogImage || 'https://eterna-five-phi.vercel.app/eterna-logo.webp');
    updateMetaTag(null, 'og:url', canonicalLinkHref);

    // 5. JSON-LD Structured Data
    let scriptTag = document.getElementById('seo-json-ld');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

  }, [title, description, keywords, canonicalUrl, ogType, ogImage, jsonLd]);

  return null;
}
