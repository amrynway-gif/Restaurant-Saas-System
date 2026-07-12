-- Fügt die Spalte theme_color hinzu, um die Branding-Farbe aus dem Logo zu speichern
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS theme_color text;
