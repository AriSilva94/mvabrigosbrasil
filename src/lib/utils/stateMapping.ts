/**
 * Mapeamento de siglas de estados brasileiros para chaves do Highcharts
 * Usadas no mapa do Brasil
 */
export const STATE_TO_HIGHCHARTS_KEY: Record<string, string> = {
  AC: "br-ac",
  AL: "br-al",
  AP: "br-ap",
  AM: "br-am",
  BA: "br-ba",
  CE: "br-ce",
  DF: "br-df",
  ES: "br-es",
  GO: "br-go",
  MA: "br-ma",
  MT: "br-mt",
  MS: "br-ms",
  MG: "br-mg",
  PA: "br-pa",
  PB: "br-pb",
  PR: "br-pr",
  PE: "br-pe",
  PI: "br-pi",
  RJ: "br-rj",
  RN: "br-rn",
  RS: "br-rs",
  RO: "br-ro",
  RR: "br-rr",
  SC: "br-sc",
  SP: "br-sp",
  SE: "br-se",
  TO: "br-to",
};

/**
 * Mapeamento de siglas de estados para nomes completos
 */
export const STATE_NAMES: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

/**
 * Converte dados de estatísticas por estado para o formato esperado pelo Highcharts
 */
export function convertStateDataToMapPoints(
  stateData: { state: string; count: number }[]
): Array<{ "hc-key": string; value: number; name: string }> {
  // Criar mapa de todos os estados com valor 0
  const allStates = Object.keys(STATE_TO_HIGHCHARTS_KEY).map((stateCode) => ({
    "hc-key": STATE_TO_HIGHCHARTS_KEY[stateCode],
    value: 0,
    name: STATE_NAMES[stateCode],
  }));

  // Atualizar com os valores reais
  stateData.forEach(({ state, count }) => {
    const stateCode = state.toUpperCase();
    const mapPoint = allStates.find(
      (point) => point["hc-key"] === STATE_TO_HIGHCHARTS_KEY[stateCode]
    );
    if (mapPoint) {
      mapPoint.value = count;
    }
  });

  return allStates;
}
