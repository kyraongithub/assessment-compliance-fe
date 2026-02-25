import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Forward title juga ke backend
    const title = formData.get("title") as string;
    if (title) {
      backendFormData.append("title", title);
    }

    const response = await fetch(`${BACKEND_URL}/templates/upload`, {
      method: "POST",
      headers: {
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
      body: backendFormData,
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    console.error("[API] POST /templates/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload template" },
      { status: 500 },
    );
  }
}
