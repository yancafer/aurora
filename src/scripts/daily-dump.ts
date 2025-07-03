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
      leagues = this.DEFAULT_LEAGUES,
      forceUpdate = false,
      includeOdds = true,
      includeStats = true,
      includeStandings = true,
    } = options;

    console.log("🚀 Iniciando dump diário...");
    console.log(`📅 Data: ${date}`);
    console.log(`🏆 Ligas: ${leagues.join(", ")}`);

    try {
      // 1. Buscar partidas do dia
      console.log("📅 Buscando partidas...");
      const allFixtures = [];

      for (const leagueId of leagues) {
        try {
          const fixtures = await ApiFootballService.getFixtures(date, leagueId);
          allFixtures.push(...fixtures);
          console.log(
            `✅ Liga ${leagueId}: ${fixtures.length} partidas encontradas`
          );

          // Delay para respeitar o limite de requisições
          await this.delay(1000);
        } catch (error) {
          console.error(
            `❌ Erro ao buscar partidas da liga ${leagueId}:`,
            error
          );
        }
      }

      console.log(`📊 Total de partidas encontradas: ${allFixtures.length}`);

      // 2. Salvar partidas no Supabase
      console.log("💾 Salvando partidas no banco de dados...");
      for (const fixture of allFixtures) {
        await this.saveFixture(fixture, forceUpdate);
      }

      // 3. Buscar e salvar odds (se habilitado)
      if (includeOdds && allFixtures.length > 0) {
        console.log("🎯 Buscando odds...");
        for (const fixture of allFixtures) {
          try {
            const odds = await ApiFootballService.getAllOddsForFixture(
              fixture.id
            );
            await this.saveOdds(fixture.id, odds, forceUpdate);
            console.log(`✅ Odds salvas para a partida ${fixture.id}`);

            // Delay para respeitar o limite de requisições
            await this.delay(2000);
          } catch (error) {
            console.error(
              `❌ Erro ao buscar odds da partida ${fixture.id}:`,
              error
            );
          }
        }
      }

      // 4. Buscar e salvar estatísticas dos times (se habilitado)
      if (includeStats && allFixtures.length > 0) {
        console.log("📈 Buscando estatísticas dos times...");
        const uniqueTeams = this.getUniqueTeams(allFixtures);
        const currentSeason = new Date().getFullYear();

        for (const team of uniqueTeams) {
          try {
            const stats = await ApiFootballService.getTeamStatistics(
              team.id,
              currentSeason,
              team.leagueId
            );
            await this.saveTeamStatistics(
              team.id,
              team.leagueId,
              stats,
              forceUpdate
            );
            console.log(`✅ Estatísticas salvas para o time ${team.name}`);

            await this.delay(1500);
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
            await this.saveStandings(leagueId, standings, forceUpdate);
            console.log(`✅ Classificação salva para a liga ${leagueId}`);

            await this.delay(1500);
          } catch (error) {
            console.error(
              `❌ Erro ao buscar classificação da liga ${leagueId}:`,
              error
            );
          }
        }
      }

      // 6. Gerar relatório final
      const summary = await this.generateDumpSummary(date);
      console.log("📋 Resumo do dump:");
      console.log(`   - Partidas: ${summary.fixtures}`);
      console.log(`   - Odds: ${summary.odds}`);
      console.log(`   - Times com estatísticas: ${summary.teamStats}`);
      console.log(`   - Classificações: ${summary.standings}`);

      console.log("✅ Dump diário concluído com sucesso!");
    } catch (error) {
      console.error("❌ Erro no dump diário:", error);
      throw error;
    }
  }

  private static async saveFixture(fixture: any, forceUpdate: boolean = false) {
    try {
      console.log(`💾 Tentando salvar partida ${fixture.id}...`);

      const existingData = !forceUpdate
        ? await supabaseAdmin
            .from("fixtures")
            .select("id")
            .eq("api_fixture_id", fixture.id)
            .single()
        : null;

      if (existingData?.data && !forceUpdate) {
        console.log(`⏭️ Partida ${fixture.id} já existe no banco de dados`);
        return;
      }

      const fixtureData = {
        api_fixture_id: fixture.id,
        date: fixture.fixture.date.split("T")[0],
        timestamp: fixture.fixture.timestamp,
        status: fixture.fixture.status,
        venue: fixture.fixture.venue,
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

      if (error) {
        console.error(
          `❌ Erro específico ao salvar partida ${fixture.id}:`,
          error
        );
        throw error;
      } else {
        console.log(`✅ Partida ${fixture.id} salva com sucesso!`, data);
      }
    } catch (error) {
      console.error(`❌ Erro geral ao salvar partida ${fixture.id}:`, error);
      throw error; // Re-throw para parar a execução e ver o erro
    }
  }

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

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execução manual com opções personalizadas
   */
  static async runManualDump(options: DumpOptions = {}): Promise<void> {
    console.log("🔧 Executando dump manual...");
    return this.runDailyDump({ ...options, forceUpdate: true });
  }

  /**
   * Dump rápido apenas com partidas e odds do dia
   */
  static async runQuickDump(date?: string): Promise<void> {
    console.log("⚡ Executando dump rápido...");
    return this.runDailyDump({
      date,
      includeStats: false,
      includeStandings: false,
      forceUpdate: false,
    });
  }

  /**
   * Dump completo para uma liga específica
   */
  static async runLeagueDump(
    leagueId: number,
    options: Partial<DumpOptions> = {}
  ): Promise<void> {
    console.log(`🏆 Executando dump da liga ${leagueId}...`);
    return this.runDailyDump({
      ...options,
      leagues: [leagueId],
      forceUpdate: true,
    });
  }
}

// Função para executar dump baseado em argumentos da linha de comando
function parseArguments(): DumpOptions {
  const args = process.argv.slice(2);
  const options: DumpOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--date":
        options.date = args[++i];
        break;
      case "--league":
        const leagues = args[++i].split(",").map(Number);
        options.leagues = leagues;
        break;
      case "--force":
        options.forceUpdate = true;
        break;
      case "--no-odds":
        options.includeOdds = false;
        break;
      case "--no-stats":
        options.includeStats = false;
        break;
      case "--no-standings":
        options.includeStandings = false;
        break;
    }
  }

  return options;
}

// Execução manual
if (require.main === module) {
  const command = process.argv[2];
  const options = parseArguments();

  let promise: Promise<void>;

  switch (command) {
    case "manual":
      promise = DailyDumpService.runManualDump(options);
      break;
    case "quick":
      promise = DailyDumpService.runQuickDump(options.date);
      break;
    case "league":
      const leagueId = parseInt(process.argv[3]);
      if (!leagueId) {
        console.error("❌ O ID da liga é obrigatório para o comando 'league'");
        process.exit(1);
      }
      promise = DailyDumpService.runLeagueDump(leagueId, options);
      break;
    default:
      promise = DailyDumpService.runDailyDump(options);
  }

  promise
    .then(() => {
      console.log("✅ Dump executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro na execução:", error);
      process.exit(1);
    });
}

// Agendamento automático (descomente para produção)
/*
cron.schedule('0 4 * * *', () => {
  console.log('🕐 Executando dump diário agendado...')
  DailyDumpService.runDailyDump()
}, {
  timezone: 'America/Sao_Paulo'
})
*/

export { DailyDumpService };
