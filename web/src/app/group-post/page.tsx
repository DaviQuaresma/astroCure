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
      setStatus([`✅ ${data.message || "Vídeos enviados com sucesso."}`]);
    } catch (err) {
      setStatus([`❌ Erro no upload: ${(err as Error).message}`]);
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
          (r: any) => `✅ ${r.profile} → ${r.video} (${r.status})`
        ) || [];
      setStatus([data.message, ...resultStatus]);
    } catch (err) {
      setStatus([`❌ Erro ao postar: ${(err as Error).message}`]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Postagem em Massa por Grupo</h1>

      <label className="block mb-2 font-medium">Vídeos</label>
      <input
        type="file"
        multiple
        accept="video/*"
        className="mb-4"
        onChange={(e) => setVideos(e.target.files)}
      />

      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6"
        onClick={handleVideoUpload}
      >
        Enviar Vídeos
      </button>

      <label className="block mb-2 font-medium">Descrição</label>
      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Texto do post"
      />

      <label className="block mb-2 font-medium">Grupo</label>
      <select
        className="w-full border rounded p-2 mb-4"
        value={group}
        onChange={(e) => setGroup(e.target.value)}
      >
        <option value="1">Grupo 1</option>
        <option value="2">Grupo 2</option>
        <option value="3">Grupo 3</option>
      </select>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleGroupPost}
      >
        Postar para o Grupo
      </button>

      <div className="mt-4 space-y-1">
        {status.map((msg, i) => (
          <p key={i} className="text-sm text-gray-700">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
