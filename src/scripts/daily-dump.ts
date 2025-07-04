import "dotenv/config";
import cron from "node-cron";
import { ApiFootballService } from "../services/api-football";
import { supabaseAdmin } from "../lib/supabase";

/**
 * Script para dump diário dos dados da API-Football
 * Executa diariamente às 04:00 para buscar:
 * - Partidas do dia
 * - Odds
 * - Estatísticas dos times
 * - Classificação das ligas
 * - Confrontos diretos
 */

interface DumpOptions {
  date?: string;
  leagues?: number[];
  forceUpdate?: boolean;
  includeOdds?: boolean;
  includeStats?: boolean;
  includeStandings?: boolean;
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

  // Métodos auxiliares devem ser static e estar antes de runDailyDump
  private static async saveOdds(
    fixtureId: number,
    odds: any[],
    forceUpdate: boolean = false
  ) {
    try {
      if (!forceUpdate) {
        const existingOdds = await supabaseAdmin
          .from("odds")
          .select("id")
          .eq("api_fixture_id", fixtureId)
          .limit(1);

        if (existingOdds.data && existingOdds.data.length > 0) {
          console.log(
            `⏭️ Odds da partida ${fixtureId} já existem no banco de dados`
          );
          return;
        }
      }

      for (const odd of odds) {
        for (const bookmaker of odd.bookmakers || []) {
          for (const bet of bookmaker.bets || []) {
            const { data, error } = await supabaseAdmin.from("odds").upsert({
              api_fixture_id: fixtureId,
              bookmaker_id: bookmaker.id,
              bookmaker_name: bookmaker.name,
              market_name: bet.name,
              values: bet.values,
              updated_at: new Date().toISOString(),
            });

            if (error) throw error;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao salvar odds:", error);
    }
  }

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

  private static async saveStandings(
    leagueId: number,
    standings: any[],
    forceUpdate: boolean = false
  ) {
    try {
      const { data, error } = await supabaseAdmin.from("standings").upsert(
        {
          league_id: leagueId,
          season: new Date().getFullYear(),
          standings: standings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "league_id,season",
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar classificação:", error);
    }
  }

  private static async generateDumpSummary(date: string) {
    try {
      const [fixtures, odds, teamStats, standings] = await Promise.all([
        supabaseAdmin.from("fixtures").select("id").eq("date", date),
        supabaseAdmin.from("odds").select("id"),
        supabaseAdmin.from("team_statistics").select("id"),
        supabaseAdmin.from("standings").select("id"),
      ]);

      return {
        fixtures: fixtures.data?.length || 0,
        odds: odds.data?.length || 0,
        teamStats: teamStats.data?.length || 0,
        standings: standings.data?.length || 0,
      };
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      return { fixtures: 0, odds: 0, teamStats: 0, standings: 0 };
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
      includeOdds = true,
      includeStats = true,
      includeStandings = true,
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
    // Nova abordagem: buscar todos os jogos do dia em uma única requisição
    let allFixtures: any[] = [];
    try {
      console.log("📅 Buscando partidas do dia (todas as ligas)...");
      allFixtures = await ApiFootballService.getFixtures(date);
      console.log(`📊 Total de partidas encontradas: ${allFixtures.length}`);
    } catch (error) {
      console.error("❌ Erro ao buscar partidas do dia:", error);
    }

    // 2. Salvar partidas no Supabase
    console.log("💾 Salvando partidas no banco de dados...");
    for (const fixture of allFixtures) {
      await DailyDumpService.saveFixture(fixture, forceUpdate);
    }

    // 3. Buscar e salvar odds (se habilitado)
    if (includeOdds && allFixtures.length > 0) {
      console.log("🎯 Buscando odds...");
      for (const fixture of allFixtures) {
        try {
          const odds = await ApiFootballService.getAllOddsForFixture(fixture.fixture?.id || fixture.id);
          await DailyDumpService.saveOdds(fixture.fixture?.id || fixture.id, odds, forceUpdate);
          console.log(`✅ Odds salvas para a partida ${fixture.fixture?.id || fixture.id}`);

          // Delay para respeitar o limite de requisições
          await DailyDumpService.delay(2000);
        } catch (error) {
          console.error(
            `❌ Erro ao buscar odds da partida ${fixture.fixture?.id || fixture.id}:`,
            error
          );
        }
      }
    }

    // 4. Buscar e salvar estatísticas dos times (se habilitado)
    if (includeStats && allFixtures.length > 0) {
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

    // 5. Buscar e salvar classificações (se habilitado)
    if (includeStandings) {
      console.log("🏆 Buscando classificações...");
      const uniqueLeagues = Array.from(
        new Set(allFixtures.map((f) => f.league.id))
      );
      const currentSeason = new Date().getFullYear();

      for (const leagueId of uniqueLeagues) {
        try {
          const standings = await ApiFootballService.getStandings(
            leagueId,
            currentSeason
          );
          await DailyDumpService.saveStandings(leagueId, standings, forceUpdate);
          console.log(`✅ Classificação salva para a liga ${leagueId}`);

          await DailyDumpService.delay(1500);
        } catch (error) {
          console.error(
            `❌ Erro ao buscar classificação da liga ${leagueId}:`,
            error
          );
        }
      }
    }

    // 6. Gerar relatório final
    const summary = await DailyDumpService.generateDumpSummary(date);
    console.log("📋 Resumo do dump:");
    console.log(`   - Partidas: ${summary.fixtures}`);
    console.log(`   - Odds: ${summary.odds}`);
    console.log(`   - Times com estatísticas: ${summary.teamStats}`);
    console.log(`   - Classificações: ${summary.standings}`);

    console.log("✅ Dump diário concluído com sucesso!");
  }

  private static async saveFixture(fixture: any, forceUpdate: boolean = false) {
    try {
      // Logar o objeto fixture completo para depuração
      console.log("[DEBUG] fixture recebido:", JSON.stringify(fixture, null, 2));

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
        date: fixture.fixture?.date?.split("T")[0] || fixture.date?.split("T")[0],
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

      // Salvar odds junto, se existirem no objeto fixture
      if (fixture.odds) {
        await DailyDumpService.saveOdds(apiFixtureId, fixture.odds, forceUpdate);
        console.log(`✅ Odds salvas junto com a partida ${apiFixtureId}`);
      }

      console.log(`✅ Partida ${apiFixtureId} salva com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao salvar partida ${fixture.fixture?.id || fixture.id}:`, error);
    }
  }
}

// Executar o dump diário imediatamente ao iniciar o serviço
(async () => {
  const dumpOptions: DumpOptions = {
    date: new Date().toISOString().split("T")[0],
    leagues: [], // Deixe vazio para buscar todas as ligas
    forceUpdate: false, // Defina como true para forçar atualização
    includeOdds: true,
    includeStats: true,
    includeStandings: true,
  };

  await DailyDumpService.runDailyDump(dumpOptions);
})();

export default DailyDumpService;
