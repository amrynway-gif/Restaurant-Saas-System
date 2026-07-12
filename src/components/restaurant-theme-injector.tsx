"use client";

function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100) };
}

export function RestaurantThemeInjector({
  themeColor,
}: {
  themeColor?: string | null;
}) {
  if (!themeColor) return null;

  const { h, s } = hexToHSL(themeColor);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      :root {
        /* LIGHT MODE: Moderately Light Background, Moderately Dark Buttons */
        
        /* Backgrounds (Pastel/Tinted) */
        --bg-base: hsl(${h}, ${s}%, 93%);
        --bg-surface: hsl(${h}, ${s}%, 97%);
        --bg-surface-2: hsl(${h}, ${s}%, 90%);
        --bg-overlay: hsl(${h}, ${s}%, 88%);

        /* Buttons & Brand Accents */
        --brand: hsl(${h}, ${s}%, 40%);
        --brand-light: hsl(${h}, ${s}%, 85%);
        --brand-dark: hsl(${h}, ${s}%, 30%);

        /* Typography */
        --text-primary: hsl(${h}, ${s}%, 15%);
        --text-secondary: hsl(${h}, ${s}%, 35%);
        --text-muted: hsl(${h}, ${s}%, 50%);
        --text-inverse: hsl(${h}, ${s}%, 98%); /* Text on buttons */

        /* Borders */
        --border: hsl(${h}, ${s}%, 85%);
        --border-strong: hsl(${h}, ${s}%, 75%);
      }
      
      [data-theme="dark"] {
        /* DARK MODE: Moderately Dark Background, Moderately Light Buttons */

        /* Backgrounds (Deep but tinted) */
        --bg-base: hsl(${h}, ${s}%, 10%);
        --bg-surface: hsl(${h}, ${s}%, 14%);
        --bg-surface-2: hsl(${h}, ${s}%, 18%);
        --bg-overlay: hsl(${h}, ${s}%, 22%);

        /* Buttons & Brand Accents */
        --brand: hsl(${h}, ${s}%, 70%);
        --brand-light: hsl(${h}, ${s}%, 25%);
        --brand-dark: hsl(${h}, ${s}%, 80%);

        /* Typography */
        --text-primary: hsl(${h}, ${s}%, 90%);
        --text-secondary: hsl(${h}, ${s}%, 70%);
        --text-muted: hsl(${h}, ${s}%, 55%);
        --text-inverse: hsl(${h}, ${s}%, 10%); /* Text on buttons */

        /* Borders */
        --border: hsl(${h}, ${s}%, 22%);
        --border-strong: hsl(${h}, ${s}%, 32%);
      }
    `,
      }}
    />
  );
}
