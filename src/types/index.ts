export interface Fixture {
  id: number;
  date: string;
  timestamp: number;
  timezone: string;
  status: {
    long: string;
    short: string;
    elapsed?: number;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
  league: League;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
}

export interface Odd {
  id: number;
  fixture_id?: number;
  api_fixture_id: number;
  bookmaker_id: number;
  bookmaker_name: string;
  market_name: string;
  values: OddValue[];
  created_at?: string;
  updated_at?: string;
}

export interface OddValue {
  value: string;
  odd: string;
}

export interface TeamStatistics {
  league: League;
  team: Team;
  form: string;
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface Analysis {
  id?: string;
  user_id: string;
  fixture_id: number;
  home_team: string;
  away_team: string;
  market: string;
  odd_value: number;
  bookmaker: string;
  implicit_probability: number;
  estimated_probability: number;
  is_manual_estimate: boolean;
  expected_value: number;
  is_value_bet: boolean;
  created_at?: string;
}

export interface Bet {
  id?: string;
  user_id: string;
  analysis_id: string;
  choice: string;
  stake: number;
  odd_value: number;
  potential_return: number;
  result?: "win" | "lose" | "pending";
  profit_loss?: number;
  match_result?: string;
  created_at?: string;
  settled_at?: string;
}

export interface BettingCalculation {
  implicitProbability: number;
  expectedValue: number;
  isValueBet: boolean;
}
