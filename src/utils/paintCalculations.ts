/**
 * Fórmulas Matemáticas Puras para Cálculo de Orçamentos de Pintura e Rendimento
 * 100% Determinístico e Livre de IA
 */

export interface RoomDimensions {
  length: number; // Comprimento em metros
  width: number; // Largura em metros
  height: number; // Pé direito em metros (padrão 2.7m)
  doorsCount?: number; // Portas padrão ~1.6m² cada (0.80 x 2.10)
  windowsCount?: number; // Janelas padrão ~2.0m² cada (1.20 x 1.60)
  includeCeiling?: boolean;
}

export interface PaintCalculationResult {
  wallAreaGross: number; // Área bruta das paredes
  deductionsArea: number; // Desconto de portas e janelas
  wallAreaNet: number; // Área líquida de paredes
  ceilingArea: number; // Área do teto
  totalPaintArea: number; // Área total a pintar
  suggestedDays: number; // Prazo estimado em dias úteis
  heightMultiplier: number; // Multiplicador por dificuldade de altura
}

export const calculateRoomArea = (params: RoomDimensions): PaintCalculationResult => {
  const {
    length,
    width,
    height = 2.7,
    doorsCount = 0,
    windowsCount = 0,
    includeCeiling = false,
  } = params;

  // Perímetro x Altura
  const perimeter = 2 * (length + width);
  const wallAreaGross = Number((perimeter * height).toFixed(2));

  // Descontos padrão da construção civil
  const doorsArea = doorsCount * 1.68; // 0.80m x 2.10m
  const windowsArea = windowsCount * 2.0; // Padrão 1.20m x 1.60m aprox.
  const deductionsArea = Number((doorsArea + windowsArea).toFixed(2));

  const wallAreaNet = Math.max(0, Number((wallAreaGross - deductionsArea).toFixed(2)));
  const ceilingArea = includeCeiling ? Number((length * width).toFixed(2)) : 0;
  const totalPaintArea = Number((wallAreaNet + ceilingArea).toFixed(2));

  // Multiplicador de pé-direito duplo ou alto
  let heightMultiplier = 1.0;
  if (height >= 4.5) {
    heightMultiplier = 1.45; // Andaime obrigatório, risco de queda
  } else if (height >= 3.3) {
    heightMultiplier = 1.2; // Escada extensível, corte alto
  }

  // Estimativa de produtividade média: 35m² a 45m² por dia para acabamento completo
  const productionPerDay = 35;
  const suggestedDays = Math.max(1, Math.ceil(totalPaintArea / productionPerDay));

  return {
    wallAreaGross,
    deductionsArea,
    wallAreaNet,
    ceilingArea,
    totalPaintArea,
    suggestedDays,
    heightMultiplier,
  };
};

/**
 * Calcula quantidade de latas/galões de tinta necessários
 */
export const calculatePaintCans = (
  totalSqm: number,
  coats: number = 2,
  coveragePerCan: number = 100, // Rendimento de lata 18L (m² por demão)
  safetyMarginPercent: number = 10 // Margem de segurança de 10%
) => {
  const effectiveArea = totalSqm * coats;
  const areaWithSafety = effectiveArea * (1 + safetyMarginPercent / 100);
  const cansDecimal = areaWithSafety / coveragePerCan;
  const wholeCans = Math.ceil(cansDecimal);

  return {
    totalEffectiveArea: Number(effectiveArea.toFixed(2)),
    areaWithSafety: Number(areaWithSafety.toFixed(2)),
    cansNeeded: wholeCans,
    exactCans: Number(cansDecimal.toFixed(2)),
  };
};

/**
 * Checklist estimado de insumos secundários
 */
export const estimateSupplies = (totalSqm: number) => {
  return {
    sandpaperSheets: Math.ceil(totalSqm / 12), // ~1 folha a cada 12m²
    maskingTapeRolls50m: Math.max(1, Math.ceil(totalSqm / 40)), // ~1 rolo para cada 40m²
    plasticDropCloth: Math.ceil(totalSqm / 30), // Lona plástica protetora
    spackleLiters: Number(((totalSqm * 0.4) / 1).toFixed(1)), // Massa corrida niveladora básica
  };
};
