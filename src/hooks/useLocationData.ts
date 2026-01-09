import { useState, useEffect, useCallback } from 'react';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

/**
 * Hook para buscar estados e cidades da API do IBGE
 *
 * @example
 * const { estados, cidades, loadingEstados, loadingCidades, fetchCidades } = useLocationData();
 */
export function useLocationData() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Busca todos os estados do Brasil na inicialização
  useEffect(() => {
    const fetchEstados = async () => {
      setLoadingEstados(true);
      try {
        const response = await fetch(
          'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
        );
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
        setEstados([]);
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Busca cidades de um estado específico
  const fetchCidades = useCallback(async (estadoSigla: string) => {
    if (!estadoSigla) {
      setCidades([]);
      return;
    }

    setLoadingCidades(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`
      );
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setCidades([]);
    } finally {
      setLoadingCidades(false);
    }
  }, []);

  return {
    estados,
    cidades,
    loadingEstados,
    loadingCidades,
    fetchCidades,
  };
}
