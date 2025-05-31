import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import * as fs from "fs/promises";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json(
        { error: "File type not specified" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}-${file.name}`;
    const uploadDir = join(process.cwd(), "public/uploads");
    const filePath = join(uploadDir, filename);
    const publicPath = `/uploads/${filename}`;

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
