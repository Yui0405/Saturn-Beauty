import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { orders } = await req.json();
    const filePath = path.join(process.cwd(), "public/data/orders.json");

    await fs.writeFile(filePath, JSON.stringify({ orders }, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving orders:", error);
    return NextResponse.json(
      { error: "Failed to save orders" },
      { status: 500 }
    );
  }
}
