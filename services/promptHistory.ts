import { PromptHistoryItem } from "../types/promptHistory";

const STORAGE_KEY = "sonet_prompt_history";

export function loadPromptHistory(): PromptHistoryItem[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : [];
}

export function savePrompt(prompt: string) {
  const history = loadPromptHistory();

  history.unshift({
    id: crypto.randomUUID(),
    prompt,
    createdAt: new Date().toISOString(),
    favorite: false,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function toggleFavorite(id: string) {
  const history = loadPromptHistory();

  const updated = history.map((item) =>
    item.id === id
      ? { ...item, favorite: !item.favorite }
      : item
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}