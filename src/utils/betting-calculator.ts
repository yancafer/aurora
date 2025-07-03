import { BettingCalculation } from "@/types";

export class BettingCalculator {
  /**
   * Calcula a probabilidade implícita baseada na odd
   * Fórmula: 100 / odd
   */
  static calculateImplicitProbability(odd: number): number {
    return 100 / odd;
  }

  /**
   * Calcula o valor esperado (Expected Value)
   * Fórmula: (odd * probabilidade_estimada_decimal) - 1
   */
  static calculateExpectedValue(
    odd: number,
    estimatedProbability: number
  ): number {
    const probabilityDecimal = estimatedProbability / 100;
    return odd * probabilityDecimal - 1;
  }

  /**
   * Determina se é uma value bet (EV > 0)
   */
  static isValueBet(expectedValue: number): boolean {
    return expectedValue > 0;
  }

  /**
   * Calcula todos os valores de uma aposta
   */
  static calculateBettingValues(
    odd: number,
    estimatedProbability: number
  ): BettingCalculation {
    const implicitProbability = this.calculateImplicitProbability(odd);
    const expectedValue = this.calculateExpectedValue(
      odd,
      estimatedProbability
    );
    const isValueBet = this.isValueBet(expectedValue);

    return {
      implicitProbability,
      expectedValue,
      isValueBet,
    };
  }
}
