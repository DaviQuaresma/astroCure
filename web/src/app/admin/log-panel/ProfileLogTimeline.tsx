"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  timestamp: string;
  type: string;
  status: string;
  user_id?: string;
  error?: string;
  context?: string;
}

export default function ProfileLogTimeline({ userId }: { userId?: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ok" | "erro">("all");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const url = new URL(
          `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/logs`
        );
        if (userId) url.searchParams.append("user_id", userId);
        const res = await fetch(url.toString());
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId]);

  const filteredLogs = logs
    .filter((log) => {
      if (filter !== "all" && log.status !== filter) return false;
      if (dateFilter) {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        return logDate === dateFilter;
      }
      return true;
    })
    .sort((a, b) =>
      order === "asc"
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  return (
    <div className="min-h-screen w-full bg-gray-950 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Logs do Perfil
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {["all", "ok", "erro"].map((f) => {
            const label =
              f === "all" ? "Todos" : f === "ok" ? "Sucesso" : "Erros";
            const color = f === "ok" ? "green" : f === "erro" ? "red" : "blue";
            return (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition
                  ${
                    filter === f
                      ? `bg-${color}-600 text-white shadow`
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {label}
              </button>
            );
          })}

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="px-3 py-2 text-sm bg-gray-800 text-white rounded"
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-800 text-white rounded"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm">
            🔄 Carregando logs...
          </p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500">⚠️ Nenhum log encontrado.</p>
        ) : (
          <ul className="space-y-6">
            {filteredLogs.map((log, i) => (
              <li
                key={i}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      log.status === "ok"
                        ? "bg-green-600 text-white"
                        : log.status === "erro"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-semibold text-white">Tipo:</span>{" "}
                  {log.type}
                </p>

                {log.context && (
                  <p className="text-sm text-gray-400 mt-2 italic">
                    {log.context}
                  </p>
                )}

                {log.error && (
                  <pre className="mt-4 bg-red-950 text-red-300 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-red-800">
                    {log.error}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
