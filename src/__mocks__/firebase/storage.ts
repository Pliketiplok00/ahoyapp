/**
 * Mock for firebase/storage
 */

export function ref(_storage: unknown, path: string) {
  return { path };
}

export async function uploadBytes(_ref: unknown, _blob: Blob) {
  return { ref: _ref };
}

export async function getDownloadURL(_ref: { path: string }) {
  return `https://firebasestorage.googleapis.com/mock/${_ref.path}`;
}

export function getStorage() {
  return {};
}
