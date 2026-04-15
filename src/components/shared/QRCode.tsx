"use client";
import { useEffect, useRef } from "react";

export function QRCode({ url, size = 200 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    import("qrcode").then(QR => {
      QR.toCanvas(canvasRef.current!, url, {
        width: size,
        margin: 2,
        color: { dark: "#1d1d1f", light: "#ffffff" },
      });
    });
  }, [url, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: 12, display: "block" }}
    />
  );
}
