/**
 * Mock for jszip
 */

class MockJSZip {
  private files: Map<string, { content: string; options: unknown }> = new Map();
  private folders: Map<string, MockJSZip> = new Map();

  file(name: string, content: string, options?: unknown): this {
    this.files.set(name, { content, options });
    return this;
  }

  folder(name: string): MockJSZip | null {
    if (!this.folders.has(name)) {
      this.folders.set(name, new MockJSZip());
    }
    return this.folders.get(name) || null;
  }

  async generateAsync(_options: { type: string }): Promise<string> {
    return 'mockZipBase64Content';
  }
}

export default MockJSZip;
