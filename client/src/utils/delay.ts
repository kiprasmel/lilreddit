export const delay = (timeMs: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeMs));
