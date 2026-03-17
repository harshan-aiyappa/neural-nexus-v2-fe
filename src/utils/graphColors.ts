/**
 * Centralized color management for Knowledge Graph Visualizations
 * Provides semantic color mapping for core entities and deterministic fallbacks
 */

export const ENTITY_COLORS: Record<string, string> = {
  // Biological Entities (Bioactives KG)
  'Herb': '#10B981',             // Emerald
  'Plant': '#059669',            // Dark Emerald
  'Compound': '#0D9488',         // Teal
  'Chemical': '#2DD4BF',         // Aquamarine
  'Phytochemical': '#14B8A6', 
  'Phytoconstituent': '#14B8A6',
  
  'TherapeuticUse': '#F59E0B',   // Amber (Renamed from NexusNode)
  'Therapeutic Use': '#F59E0B',
  
  'Disease': '#EF4444',          // Red
  'Condition': '#F87171',        // Light Red
  'Symptom': '#FB7185',          // Rose
  
  'Gene': '#8B5CF6',             // Violet
  'Protein': '#A78BFA',          // Light Violet
  
  // System / Core Entities
  'Person': '#64748B',           // Slate
  'Researcher': '#475569', 
  'Project': '#3B82F6',          // Blue
  'Organization': '#2563EB',     // Dark Blue
  
  'Default': '#94A3B8'           // Light Slate
};

/**
 * Normalizes a label to Sentence Case
 */
export const toSentenceCase = (str: string): string => {
  if (!str) return '';
  // Handle camelCase or SCREAMING_SNAKE_CASE
  const clean = str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

/**
 * Returns a deterministic color for a given label
 */
export const getEntityColor = (label: string): string => {
  const normalized = toSentenceCase(label);
  
  // Direct match in our palette
  if (ENTITY_COLORS[normalized]) return ENTITY_COLORS[normalized];
  
  // Partial matches (case insensitive)
  const lowerLabel = normalized.toLowerCase();
  for (const [key, color] of Object.entries(ENTITY_COLORS)) {
    if (lowerLabel.includes(key.toLowerCase())) return color;
  }
  
  return generateDeterministicColor(normalized);
};

/**
 * Generates an HSL color based on a string hash to ensure variety for unknown labels
 */
const generateDeterministicColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash % 360);
  const s = 60 + (Math.abs(hash % 20)); // 60-80% saturation
  const l = 45 + (Math.abs(hash % 15)); // 45-60% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};
