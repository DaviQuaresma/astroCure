"use client";

import { useEffect, useState } from "react";
import ProfileModal from "@/components/ProfileModal";

interface Profile {
  id: number;
  group: number;
  user_id: string;
  tiktok?: { email?: string; password?: string };
  instagram?: { email?: string; password?: string };
  youtube?: { email?: string; password?: string };
  kwai?: { email?: string; password?: string };
}

export default function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profiles`
      );
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${id}`, {
        method: "DELETE",
      });
      fetchProfiles();
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen text-white ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Perfis</h1>
        <button
          onClick={() => {
            setSelectedProfile(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          + Criar Perfil
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando perfis...</p>
      ) : profiles.length === 0 ? (
        <p className="text-gray-500">Nenhum perfil encontrado.</p>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">ID: {profile.id}</p>
                  <p className="font-medium">User ID: {profile.user_id}</p>
                  <p className="text-sm text-gray-400">
                    Grupo: {profile.group}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProfile(profile);
                      setIsModalOpen(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProfileModal
        open={isModalOpen}
        onClose={() => {
          setSelectedProfile(null);
          setIsModalOpen(false);
        }}
        onSuccess={fetchProfiles}
        profile={selectedProfile}
      />
    </div>
  );
}
