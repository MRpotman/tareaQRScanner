// src/qr-scanner.d.ts
declare module 'qr-scanner' {
  export default class QrScanner {
    static scanImage(
      image: string | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' }
    ): Promise<string>;
  }
}
