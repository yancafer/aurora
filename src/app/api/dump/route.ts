import { NextRequest, NextResponse } from "next/server";
import { DailyDumpService } from "@/scripts/daily-dump";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "daily",
      date,
      leagues,
      forceUpdate = false,
      includeOdds = true,
      includeStats = true,
      includeStandings = true,
    } = body;

    // Verificar se tem autorização (opcional - você pode adicionar autenticação aqui)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.DUMP_API_KEY}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log(`🔄 Iniciando dump via API - Tipo: ${type}`);

    let result;

    switch (type) {
      case "manual":
        result = await DailyDumpService.runManualDump({
          date,
          leagues,
          forceUpdate,
          includeOdds,
          includeStats,
          includeStandings,
        });
        break;

      case "quick":
        result = await DailyDumpService.runQuickDump(date);
        break;

      case "league":
        if (!leagues || leagues.length === 0) {
          return NextResponse.json(
            { error: "ID da liga é obrigatório para dump por liga" },
            { status: 400 }
          );
        }
        result = await DailyDumpService.runLeagueDump(leagues[0], {
          date,
          forceUpdate,
          includeOdds,
          includeStats,
          includeStandings,
        });
        break;

      default:
        result = await DailyDumpService.runDailyDump({
          date,
          leagues,
          forceUpdate,
          includeOdds,
          includeStats,
          includeStandings,
        });
    }

    return NextResponse.json({
      success: true,
      message: `Dump ${type} executado com sucesso`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro no dump via API:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  if (status === "health") {
    return NextResponse.json({
      status: "OK",
      message: "API de dump funcionando",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    message: "API de Dump Diário",
    endpoints: {
      "POST /api/dump": "Executar dump manual",
      "GET /api/dump?status=health": "Verificar status da API",
    },
    types: ["daily", "manual", "quick", "league"],
    example: {
      type: "manual",
      date: "2025-07-02",
      leagues: [39, 140],
      forceUpdate: true,
      includeOdds: true,
      includeStats: true,
      includeStandings: true,
    },
  });
}
