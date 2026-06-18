const DEFAULT_PIP_VALUE_PER_LOT = 10;

function calcLotSize(balance, riskPercent, slPips, pipValuePerLot = DEFAULT_PIP_VALUE_PER_LOT) {
  const cashRisk = balance * (riskPercent / 100);
  const lot = cashRisk / (slPips * pipValuePerLot);
  return Math.max(0.01, Math.round(lot * 100) / 100);
}

module.exports = { calcLotSize, DEFAULT_PIP_VALUE_PER_LOT };
