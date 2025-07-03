import axios from "axios";
import { Fixture, Odd, TeamStatistics, Standing } from "@/types";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
// Corrigido: usar RAPID_API_KEY do .env
const API_KEY = process.env.RAPID_API_KEY;

const apiClient = axios.create({
  baseURL: API_FOOTBALL_BASE_URL,
  headers: {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": "v3.football.api-sports.io",
  },
});

export class ApiFootballService {
  static async getFixtures(date: string, league?: number): Promise<Fixture[]> {
    try {
      const params: any = { date };
      if (league) params.league = league;

      const response = await apiClient.get("/fixtures", { params });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      throw error;
    }
  }

  static async getOdds(fixtureId: number): Promise<Odd[]> {
    try {
      const response = await apiClient.get(`/odds`, {
        params: {
          fixture: fixtureId,
          bookmaker: "8", // Bet365
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching odds:", error);
      throw error;
    }
  }

  static async getTeamStatistics(
    teamId: number,
    season: number,
    leagueId: number
  ): Promise<TeamStatistics> {
    try {
      const response = await apiClient.get("/teams/statistics", {
        params: {
          team: teamId,
          season: season,
          league: leagueId,
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching team statistics:", error);
      throw error;
    }
  }

  static async getStandings(
    leagueId: number,
    season: number
  ): Promise<Standing[]> {
    try {
      const response = await apiClient.get("/standings", {
        params: {
          league: leagueId,
          season: season,
        },
      });
      return response.data.response[0]?.league?.standings[0] || [];
    } catch (error) {
      console.error("Error fetching standings:", error);
      throw error;
    }
  }

  static async getHeadToHead(team1: number, team2: number): Promise<Fixture[]> {
    try {
      const response = await apiClient.get("/fixtures/headtohead", {
        params: {
          h2h: `${team1}-${team2}`,
          last: 10,
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching head to head:", error);
      throw error;
    }
  }

  static async getFixturesByLeague(
    leagueId: number,
    season: number,
    from?: string,
    to?: string
  ): Promise<Fixture[]> {
    try {
      const params: any = {
        league: leagueId,
        season: season,
      };
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await apiClient.get("/fixtures", { params });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching fixtures by league:", error);
      throw error;
    }
  }

  static async getLeagues(): Promise<any[]> {
    try {
      const response = await apiClient.get("/leagues");
      return response.data.response;
    } catch (error) {
      console.error("Error fetching leagues:", error);
      throw error;
    }
  }

  static async getTeamForm(
    teamId: number,
    leagueId: number,
    season: number,
    last: number = 5
  ): Promise<Fixture[]> {
    try {
      const response = await apiClient.get("/fixtures", {
        params: {
          team: teamId,
          league: leagueId,
          season: season,
          last: last,
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching team form:", error);
      throw error;
    }
  }

  static async getAllOddsForFixture(fixtureId: number): Promise<Odd[]> {
    try {
      const response = await apiClient.get("/odds", {
        params: {
          fixture: fixtureId,
        },
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching all odds:", error);
      throw error;
    }
  }
}
