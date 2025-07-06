export * from "./index";

// Interface principal para análise esportiva
export interface Analysis {
  id?: number;
  user_id?: string;
  fixture_id?: number;
  api_fixture_id?: number | string;
  home_team?: string;
  away_team?: string;
  market?: string;
  odd_value?: number;
  bookmaker?: string;
  implicit_probability?: number;
  estimated_probability?: number;
  is_manual_estimate?: boolean;
  expected_value?: number;
  is_value_bet?: boolean;
  fixture_date?: string;
  fixture_timestamp?: number;
  // Novos campos probabilísticos e recomendação
  prob_1?: number;
  prob_x?: number;
  prob_2?: number;
  prob_over25?: number;
  prob_btts?: number;
  xg_home?: number;
  xg_away?: number;
  poisson_home?: number[];
  poisson_away?: number[];
  valor_esperado_1?: number;
  valor_esperado_x?: number;
  valor_esperado_2?: number;
  recomendacao?: string;
  created_at?: string;
}
