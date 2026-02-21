/**
 * Mock for expo-image-manipulator
 */

export const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
};

export async function manipulateAsync(
  uri: string,
  actions: unknown[],
  options: { compress?: number; format?: string; base64?: boolean }
): Promise<{ uri: string; width: number; height: number; base64?: string }> {
  return {
    uri: uri,
    width: 1024,
    height: 768,
    base64: options.base64 ? 'mockBase64Data' : undefined,
  };
}

export default {
  SaveFormat,
  manipulateAsync,
};
