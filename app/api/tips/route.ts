import { NextResponse } from "next/server";
import { getTips, updateTip } from "@/lib/api-service";

export async function GET() {
  const tips = await getTips();
  return NextResponse.json(tips);
}

export async function PUT(request: Request) {
  try {
    const tip = await request.json();
    const success = await updateTip(tip);

    if (success) {
      return NextResponse.json({ message: "Tip updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Error updating tip" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
