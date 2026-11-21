// Nombres válidos de ToolIcon. Tools.astro valida los del diccionario contra esta lista:
// un nombre mal escrito rompe el build en vez de dibujar un ícono vacío.
export const toolIconNames = [
  'figma',
  'wordpress',
  'gemini',
  'claude',
  'elevenlabs',
  'design',
  'video',
  'ai',
  'templates',
] as const;

export type ToolIconName = (typeof toolIconNames)[number];

export function toToolIcon(name: string): ToolIconName {
  if ((toolIconNames as readonly string[]).includes(name)) return name as ToolIconName;
  throw new Error(
    `Herramientas: ícono desconocido "${name}" (válidos: ${toolIconNames.join(', ')})`,
  );
}
