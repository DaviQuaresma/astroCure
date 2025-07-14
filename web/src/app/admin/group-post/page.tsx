"use client";

import { useState } from "react";

interface UploadedVideo {
  filename: string;
  path: string;
}

export default function GroupPostPage() {
  const [videos, setVideos] = useState<FileList | null>(null);
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("1");
  const [status, setStatus] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);

  const handleVideoUpload = async () => {
    if (!videos || videos.length === 0) {
      alert("Selecione pelo menos um vídeo.");
      return;
    }

    const formData = new FormData();
    Array.from(videos).forEach((file) => formData.append("videos", file));

    setStatus(["Enviando vídeos..."]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/multiple`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setUploadedVideos(data.files || []);
      setStatus([`${data.message || "Vídeos enviados com sucesso."}`]);
    } catch (err) {
      setStatus([`Erro no upload: ${(err as Error).message}`]);
    }
  };

  const handleGroupPost = async () => {
    if (uploadedVideos.length === 0) {
      alert("Faça upload dos vídeos antes de postar.");
      return;
    }

    const payload = {
      videos: uploadedVideos.map((video) => video.path),
      description,
      group: parseInt(group),
    };

    setStatus(["Enviando postagem para o grupo..."]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/group`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      const resultStatus =
        data.results?.map(
          (r: any) => `${r.profile} → ${r.video} (${r.status})`
        ) || [];
      setStatus([data.message, ...resultStatus]);
    } catch (err) {
      setStatus([`❌ Erro ao postar: ${(err as Error).message}`]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white p-8">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-lg p-8 space-y-8 border border-gray-800">
        <h1 className="text-3xl font-bold text-blue-400 text-center">
          Postagem em Massa por Grupo
        </h1>

        {/* Seletor de vídeos */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Selecione os vídeos
          </label>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => setVideos(e.target.files)}
            className="block w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg p-2 file:bg-gray-700 file:border-0 file:px-4 file:py-2 file:rounded file:text-sm file:text-white file:cursor-pointer"
          />
        </div>

        {/* Botão de upload */}
        <div className="text-center">
          <button
            onClick={handleVideoUpload}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-semibold transition"
          >
            Enviar Vídeos
          </button>
        </div>

        {/* Campo de descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Texto do post"
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
          />
        </div>

        {/* Grupo de postagem */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Grupo
          </label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
          >
            <option value="1">Grupo 1</option>
            <option value="2">Grupo 2</option>
            <option value="3">Grupo 3</option>
          </select>
        </div>

        {/* Botão de postagem */}
        <div className="text-center">
          <button
            onClick={handleGroupPost}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-semibold transition"
          >
            Postar para o Grupo
          </button>
        </div>

        {/* Lista de status */}
        {status.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 text-sm space-y-1 border border-gray-700">
            {status.map((msg, i) => (
              <p key={i} className="text-green-400 whitespace-pre-wrap">
                {msg}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
