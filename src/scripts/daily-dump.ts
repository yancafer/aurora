import "dotenv/config";
import cron from "node-cron";
import { ApiFootballService } from "../services/api-football";
import { supabaseAdmin } from "../lib/supabase";
import { main as generateAnalyses } from "./generate-analyses";

/**
 * Script para dump diário dos dados da API-Football
 * Executa diariamente às 04:00 para buscar:
 * - Partidas do dia
 * - Estatísticas dos times
 */

interface DumpOptions {
  date?: string;
  leagues?: number[];
  forceUpdate?: boolean;
}

class DailyDumpService {
  private static readonly DEFAULT_LEAGUES = [
    39, // Premier League
    140, // La Liga
    78, // Bundesliga
    135, // Serie A
    61, // Ligue 1
    71, // Brasileirão
    2, // Champions League
    3, // UEFA Europa League
  ];

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getUniqueTeams(
    fixtures: any[]
  ): Array<{ id: number; name: string; leagueId: number }> {
    const teams = new Map();
    fixtures.forEach((fixture) => {
      const homeTeam = {
        id: fixture.teams.home.id,
        name: fixture.teams.home.name,
        leagueId: fixture.league.id,
      };
      const awayTeam = {
        id: fixture.teams.away.id,
        name: fixture.teams.away.name,
        leagueId: fixture.league.id,
      };
      teams.set(homeTeam.id, homeTeam);
      teams.set(awayTeam.id, awayTeam);
    });
    return Array.from(teams.values());
  }

  private static async saveTeamStatistics(
    teamId: number,
    leagueId: number,
    stats: any,
    forceUpdate: boolean = false
  ) {
    try {
      const { data, error } = await supabaseAdmin
        .from("team_statistics")
        .upsert(
          {
            team_id: teamId,
            league_id: leagueId,
            season: new Date().getFullYear(),
            statistics: stats,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "team_id,league_id,season",
          }
        );
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar estatísticas do time:", error);
    }
  }

  static async runDailyDump(options: DumpOptions = {}): Promise<void> {
    // Verificar se as variáveis de ambiente estão carregadas
    console.log("🔍 Verificando configuração...");
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceRoleKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!");
      throw new Error("Service role key não configurada");
    }
    if (!supabaseUrl) {
      console.error("❌ NEXT_PUBLIC_SUPABASE_URL não encontrada!");
      throw new Error("Supabase URL não configurada");
    }
    console.log(
      `✅ Service Role Key: ${serviceRoleKey.slice(
        0,
        6
      )}...${serviceRoleKey.slice(-6)}`
    );
    console.log(`✅ Supabase URL: ${supabaseUrl}`);
    const {
      date = new Date().toISOString().split("T")[0],
      leagues,
      forceUpdate = false,
    } = options;
    let leagueIds: number[];
    if (!leagues || leagues.length === 0) {
      console.log("🌍 Buscando todas as ligas disponíveis...");
      const allLeagues = await ApiFootballService.getLeagues();
      leagueIds = allLeagues.map((l: any) => l.league.id);
      console.log(`🏆 Total de ligas encontradas: ${leagueIds.length}`);
    } else {
      leagueIds = leagues;
    }
    console.log("🚀 Iniciando dump diário...");
    console.log(`📅 Data: ${date}`);
    // Buscar todos os jogos do dia em uma única requisição
    let allFixtures: any[] = [];
    try {
      console.log("📅 Buscando partidas do dia (todas as ligas)...");
      allFixtures = await ApiFootballService.getFixtures(date);
      console.log(`📊 Total de partidas encontradas: ${allFixtures.length}`);
    } catch (error) {
      console.error("❌ Erro ao buscar partidas do dia:", error);
    }
    // Salvar partidas no Supabase
    console.log("💾 Salvando partidas no banco de dados...");
    for (const fixture of allFixtures) {
      await DailyDumpService.saveFixture(fixture, forceUpdate);
    }
    // Buscar e salvar estatísticas dos times
    if (allFixtures.length > 0) {
      console.log("📈 Buscando estatísticas dos times...");
      const uniqueTeams = DailyDumpService.getUniqueTeams(allFixtures);
      const currentSeason = new Date().getFullYear();
      for (const team of uniqueTeams) {
        try {
          const stats = await ApiFootballService.getTeamStatistics(
            team.id,
            currentSeason,
            team.leagueId
          );
          await DailyDumpService.saveTeamStatistics(
            team.id,
            team.leagueId,
            stats,
            forceUpdate
          );
          console.log(`✅ Estatísticas salvas para o time ${team.name}`);
          await DailyDumpService.delay(1500);
        } catch (error) {
          console.error(
            `❌ Erro ao buscar estatísticas do time ${team.name}:`,
            error
          );
        }
      }
    }
    // Gerar relatório final
    const fixturesCount = allFixtures.length;
    const teamsCount =
      allFixtures.length > 0
        ? DailyDumpService.getUniqueTeams(allFixtures).length
        : 0;
    console.log("📋 Resumo do dump:");
    console.log(`   - Partidas: ${fixturesCount}`);
    console.log(`   - Times com estatísticas: ${teamsCount}`);
    console.log("✅ Dump diário concluído com sucesso!");
    // Gerar análises automáticas após o dump
    const user_id = process.env.DUMP_ANALYSIS_USER_ID || "demo-user";
    await generateAnalyses(date, user_id);
    console.log("✅ Análises automáticas geradas!");
  }

  private static async saveFixture(fixture: any, forceUpdate: boolean = false) {
    try {
      // Logar o objeto fixture completo para depuração
      console.log(
        "[DEBUG] fixture recebido:",
        JSON.stringify(fixture, null, 2)
      );
      // Corrigir acesso ao id do fixture
      const apiFixtureId = fixture.fixture?.id || fixture.id;
      if (!apiFixtureId) {
        console.error("[ERRO] fixture sem id detectado!", fixture);
        throw new Error("Fixture sem id válido");
      }
      console.log(`💾 Tentando salvar partida ${apiFixtureId}...`);
      const existingData = !forceUpdate
        ? await supabaseAdmin
            .from("fixtures")
            .select("id")
            .eq("api_fixture_id", apiFixtureId)
            .single()
        : null;
      if (existingData?.data && !forceUpdate) {
        console.log(`⏭️ Partida ${apiFixtureId} já existe no banco de dados`);
        return;
      }
      const fixtureData = {
        api_fixture_id: apiFixtureId,
        date:
          fixture.fixture?.date?.split("T")[0] || fixture.date?.split("T")[0],
        timestamp: fixture.fixture?.timestamp || fixture.timestamp,
        status: fixture.fixture?.status || fixture.status,
        venue: fixture.fixture?.venue || fixture.venue,
        teams: fixture.teams,
        goals: fixture.goals,
        score: fixture.score,
        league: fixture.league,
        updated_at: new Date().toISOString(),
      };
      console.log(
        `📝 Dados da partida a serem salvos:`,
        JSON.stringify(fixtureData, null, 2)
      );
      const { data, error } = await supabaseAdmin
        .from("fixtures")
        .upsert(fixtureData, {
          onConflict: "api_fixture_id",
        });
      if (error) throw error;
      console.log(`✅ Partida ${apiFixtureId} salva com sucesso!`);
    } catch (error) {
      console.error(
        `❌ Erro ao salvar partida ${fixture.fixture?.id || fixture.id}:`,
        error
      );
    }
  }
}

// Executar o dump diário imediatamente ao iniciar o serviço
(async () => {
  const dumpOptions: DumpOptions = {
    date: new Date().toISOString().split("T")[0],
    leagues: [], // Deixe vazio para buscar todas as ligas
    forceUpdate: false, // Defina como true para forçar atualização
  };
  await DailyDumpService.runDailyDump(dumpOptions);
})();

export default DailyDumpService;
