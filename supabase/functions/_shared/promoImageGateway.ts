export const imageSettings = {
  baseURL: "https://ai.gateway.lovable.dev",
  model: "openai/gpt-image-2.5-sunburst",
  format: "openai",
} as const;

export function generatePromoImage(apiKey: string, prompt: string, size: string, stream: boolean) {
  return fetch(`${imageSettings.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: imageSettings.model, prompt, size,
      ...(stream ? { stream: true, partial_images: 1 } : {}),
    }),
  });
}