"use client";
export function QRCode({ url, size = 200 }: { url: string; size?: number }) {
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1d1d1f&margin=10`;
  return (
    <img src={apiUrl} alt="QR Code" width={size} height={size} style={{ borderRadius: 12, display: "block" }} />
  );
}
