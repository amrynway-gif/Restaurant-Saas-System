import QRCode from "qrcode";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");
  if (!data?.trim()) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const png = await QRCode.toBuffer(data, {
      type: "png",
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 });
  }
}
