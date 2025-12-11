import { unformatDigits } from "@/lib/formatters";

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};

export function isValidCepFormat(cep: string): boolean {
  const digits = unformatDigits(cep);
  return digits.length === 8;
}

export async function fetchAddressFromCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = unformatDigits(cep);

  if (!isValidCepFormat(cep)) {
    throw new Error("CEP deve ter 8 dígitos");
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: AbortSignal.timeout(5000), // timeout 5s
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro) {
      throw new Error("CEP não encontrado");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        throw new Error("Timeout ao buscar CEP. Tente novamente.");
      }
      throw error;
    }
    throw new Error("Erro ao buscar CEP");
  }
}
