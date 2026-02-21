/**
 * Mock for expo-clipboard
 */

export async function setStringAsync(_text: string): Promise<boolean> {
  return true;
}

export async function getStringAsync(): Promise<string> {
  return 'mock-clipboard-content';
}

export default {
  setStringAsync,
  getStringAsync,
};
