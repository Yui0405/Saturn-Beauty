import { NextResponse } from "next/server";
import { getNews, updateNews } from "@/lib/api-service";

export async function GET() {
  const news = await getNews();
  return NextResponse.json(news);
}

export async function PUT(request: Request) {
  try {
    const newsItem = await request.json();
    const success = await updateNews(newsItem);

    if (success) {
      return NextResponse.json({ message: "News updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Error updating news" },
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
