"use client";

import { useEffect, useState } from "react";

export default function AdsPowerEndpoints() {
  const [status, setStatus] = useState(""); // Para o status de operações
  const [endpoints, setEndpoints] = useState<any[]>([]); // Endpoints cadastrados
  const [newEndpoint, setNewEndpoint] = useState(""); // Para o novo endpoint
  const [activeEndpoint, setActiveEndpoint] = useState<any | null>(null); // Endpoint ativo

  // Função para criar um novo endpoint
  const createAdsPower = async () => {
    if (!newEndpoint) {
      setStatus("Por favor, insira um URL de endpoint.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/adsPower`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endPoint: newEndpoint }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao criar o endpoint.");
      }

      setStatus("Endpoint criado com sucesso!");
      setNewEndpoint(""); // Limpar o campo após sucesso
      fetchEndpoints(); // Recarregar os endpoints
    } catch (error) {
      console.error("Erro:", error);
      setStatus("Erro ao criar o endpoint.");
    }
  };

  // Função para ativar o endpoint
  const setActiveAdsPower = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/adsPower/active/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao ativar o endpoint.");
      }

      const data = await res.json();
      setActiveEndpoint(""); // Definindo o endpoint ativo
      setStatus(`Endpoint "${data.endPoint}" ativado com sucesso!`);
    } catch (error) {
      console.error("Erro:", error);
      setStatus("Erro ao ativar o endpoint.");
    }
  };

  // Função para buscar todos os endpoints
  const fetchEndpoints = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/adsPower`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao obter os endpoints.");
      }

      const data = await res.json();
      setEndpoints(data); // Atualiza a lista de endpoints
    } catch (error) {
      console.error("Erro:", error);
      setStatus("Erro ao obter os endpoints.");
    }
  };

  // Carregar todos os endpoints ao iniciar o componente
  useEffect(() => {
    fetchEndpoints();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white p-8">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-blue-400 text-center mb-6">
          Gerenciar Endpoints AdsPower
        </h1>

        {/* Campo para criar um novo endpoint */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Novo Endpoint
            </label>
            <input
              type="text"
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
              className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a URL do novo endpoint"
            />
          </div>
          <button
            onClick={createAdsPower}
            className="w-full bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-white font-semibold transition"
          >
            Criar Endpoint
          </button>
        </div>

        {/* Status de criação */}
        {status && <p className="text-center text-green-400 mb-4">{status}</p>}

        {/* Exibição de todos os endpoints cadastrados */}
        <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Endpoints Cadastrados
          </h2>
          <ul className="space-y-3">
            {endpoints.map((endpoint: any) => (
              <li
                key={endpoint.id}
                className="flex items-center justify-between bg-gray-800 p-4 rounded-xl"
              >
                <span className="text-gray-300">{endpoint.endPoint}</span>
                <button
                  onClick={() => setActiveAdsPower(endpoint.id)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white font-semibold"
                >
                  Ativar
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Exibindo o endpoint ativo */}
        {activeEndpoint && (
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              Endpoint Ativo
            </h3>
            <p className="text-gray-300">
              Endpoint Ativo: {activeEndpoint.endPoint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
