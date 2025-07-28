"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

interface Profile {
  id?: number;
  group: number;
  user_id: string;
  tiktok?: { email?: string; password?: string };
  instagram?: { email?: string; password?: string };
  youtube?: { email?: string; password?: string };
  kwai?: { email?: string; password?: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profile?: Profile | null;
}

type Platform = "tiktok" | "instagram" | "youtube" | "kwai";
type PlatformData = { email?: string; password?: string };

export default function ProfileModal({
  open,
  onClose,
  onSuccess,
  profile,
}: Props) {
  const [formData, setFormData] = useState<Profile>({
    group: 1,
    user_id: "",
    tiktok: {},
    instagram: {},
    youtube: {},
    kwai: {},
  });

  useEffect(() => {
    if (profile) setFormData(profile);
    else
      setFormData({
        group: 1,
        user_id: "",
        tiktok: {},
        instagram: {},
        youtube: {},
        kwai: {},
      });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [platform, field] = name.split(".") as [
        Platform,
        keyof PlatformData
      ];
      setFormData((prev) => ({
        ...prev,
        [platform]: {
          ...(prev[platform] ?? {}),
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "group" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = profile ? "PUT" : "POST";
    const url = profile
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profile.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/profiles`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      console.error("Erro ao salvar perfil");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded bg-gray-900 border border-gray-700 p-6">
          <Dialog.Title className="text-xl text-white font-semibold mb-4">
            {profile ? "Editar Perfil" : "Criar Novo Perfil"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grupo e User ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Grupo
                </label>
                <input
                  type="number"
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  required
                />
              </div>
            </div>

            {/* Seção de plataformas */}
            {["tiktok", "instagram", "youtube", "kwai"].map((platform) => (
              <details key={platform} className="bg-gray-800 rounded p-3">
                <summary className="cursor-pointer text-gray-300 font-medium">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name={`${platform}.email`}
                      placeholder="Email"
                      value={(formData as any)[platform]?.email || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Senha
                    </label>
                    <input
                      type="text"
                      name={`${platform}.password`}
                      placeholder="Senha"
                      value={(formData as any)[platform]?.password || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 text-white p-2 rounded"
                    />
                  </div>
                </div>
              </details>
            ))}

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm text-white"
              >
                {profile ? "Salvar Alterações" : "Criar Perfil"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
