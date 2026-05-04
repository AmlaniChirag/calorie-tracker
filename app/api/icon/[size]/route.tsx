import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = Math.min(Math.max(parseInt(sizeStr) || 192, 16), 1024);
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.52);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
          borderRadius: radius,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
