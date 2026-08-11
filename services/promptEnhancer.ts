export function enhancePrompt(prompt: string): string {

  return `
${prompt},

masterpiece,
best quality,
ultra realistic,
8K HDR,
award-winning photography,
cinematic lighting,
professional composition,
highly detailed,
sharp focus,
photorealistic,
premium quality,
realistic skin texture,
global illumination,
depth of field,
professional color grading,
studio quality
`.trim();

}