import { NextRequest, NextResponse } from "next/server";
import { main as generateAnalyses } from "@/scripts/generate-analyses";

export async function POST(req: NextRequest) {
  try {
    const { user_id, date } = await req.json();
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }
    const dateStr = date || new Date().toISOString().split("T")[0];
    await generateAnalyses(dateStr, user_id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao gerar análises" },
      { status: 500 }
    );
  }
}
