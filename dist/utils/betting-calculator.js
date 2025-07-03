"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BettingCalculator = void 0;
var BettingCalculator = /** @class */ (function () {
    function BettingCalculator() {
    }
    /**
     * Calcula a probabilidade implícita baseada na odd
     * Fórmula: 100 / odd
     */
    BettingCalculator.calculateImplicitProbability = function (odd) {
        return 100 / odd;
    };
    /**
     * Calcula o valor esperado (Expected Value)
     * Fórmula: (odd * probabilidade_estimada_decimal) - 1
     */
    BettingCalculator.calculateExpectedValue = function (odd, estimatedProbability) {
        var probabilityDecimal = estimatedProbability / 100;
        return odd * probabilityDecimal - 1;
    };
    /**
     * Determina se é uma value bet (EV > 0)
     */
    BettingCalculator.isValueBet = function (expectedValue) {
        return expectedValue > 0;
    };
    /**
     * Calcula todos os valores de uma aposta
     */
    BettingCalculator.calculateBettingValues = function (odd, estimatedProbability) {
        var implicitProbability = this.calculateImplicitProbability(odd);
        var expectedValue = this.calculateExpectedValue(odd, estimatedProbability);
        var isValueBet = this.isValueBet(expectedValue);
        return {
            implicitProbability: implicitProbability,
            expectedValue: expectedValue,
            isValueBet: isValueBet,
        };
    };
    return BettingCalculator;
}());
exports.BettingCalculator = BettingCalculator;
