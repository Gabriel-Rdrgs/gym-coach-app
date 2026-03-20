"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useToast } from "@/components/Toast";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

interface Stats {
  totalWorkouts: number;
  totalMetrics: number;
  totalPRs: number;
}

export default function ProfileClient() {
  const toast = useToast();

  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado do formulário de nome
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Estado do formulário de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setStats(data.stats);
        setNewName(data.user.name ?? "");
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;

    setSavingName(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar nome");

      setUser((prev) => prev ? { ...prev, name: newName.trim() } : prev);
      setEditingName(false);
      toast.success("Nome atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar nome. Tente novamente.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao atualizar senha.");
        return;
      }

      toast.success("Senha atualizada com sucesso!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div style={{ color: "var(--accent-primary)" }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen py-12">
      <div className="w-full max-w-2xl">

        {/* Título */}
        <div className="mb-16 text-center">
          <h1
            className="text-5xl font-bold mb-6 text-glow"
            style={{
              color: "var(--accent-primary)",
              fontFamily: "var(--font-orbitron), sans-serif",
              letterSpacing: "2px",
            }}
          >
            Perfil
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Card de estatísticas */}
        {stats && (
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 mb-10">
            <div className="card-neon text-center" style={{ padding: "24px" }}>
              <div className="text-3xl font-bold mb-2 text-glow" style={{ color: "var(--accent-primary)" }}>
                {stats.totalWorkouts}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Treinos
              </div>
            </div>
            <div className="card-neon text-center" style={{ padding: "24px" }}>
              <div className="text-3xl font-bold mb-2 text-glow" style={{ color: "var(--accent-secondary)" }}>
                {stats.totalMetrics}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Métricas
              </div>
            </div>
            <div className="card-neon text-center" style={{ padding: "24px" }}>
              <div className="text-3xl font-bold mb-2 text-glow" style={{ color: "var(--accent-success)" }}>
                {stats.totalPRs}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                PRs
              </div>
            </div>
          </div>
        )}

        {/* Card de informações */}
        <div className="card-neon mb-6" style={{ padding: "40px" }}>
          <h2
            className="text-xl font-bold mb-8"
            style={{ color: "var(--accent-primary)" }}
          >
            Informações da Conta
          </h2>

          <div className="space-y-6">

            {/* Nome */}
            <div className="pb-6 border-b" style={{ borderColor: "rgba(0, 217, 255, 0.2)" }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Nome
                </label>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    Editar
                  </button>
                )}
              </div>

              {editingName ? (
                <div className="flex gap-3 mt-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-neon flex-1"
                    placeholder="Seu nome"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    {savingName ? "..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user?.name ?? "");
                    }}
                    className="btn-secondary px-4"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
                  {user?.name || "—"}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="pb-6 border-b" style={{ borderColor: "rgba(0, 217, 255, 0.2)" }}>
              <label className="text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <p className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
                {user?.email}
              </p>
            </div>

            {/* Membro desde */}
            <div>
              <label className="text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Membro desde
              </label>
              <p className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
                {user?.createdAt ? formatDate(user.createdAt) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Card de senha */}
        <div className="card-neon mb-6" style={{ padding: "40px" }}>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--accent-primary)" }}
            >
              Segurança
            </h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--accent-secondary)" }}
              >
                Alterar senha
              </button>
            )}
          </div>

          {showPasswordForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--accent-primary)" }}>
                  Senha atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-neon w-full"
                  placeholder="Sua senha atual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--accent-primary)" }}>
                  Nova senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-neon w-full"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--accent-primary)" }}>
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-neon w-full"
                  placeholder="Repita a nova senha"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {savingPassword ? "Salvando..." : "Salvar nova senha"}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sua senha está protegida. Use o botão acima para alterá-la.
            </p>
          )}
        </div>

        {/* Botão de logout */}
        <div className="card-neon" style={{ padding: "40px" }}>
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--accent-primary)" }}
          >
            Sessão
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Ao sair, você precisará fazer login novamente para acessar o app.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-secondary w-full py-4 font-semibold"
            style={{
              color: "var(--accent-warning)",
              borderColor: "var(--accent-warning)",
            }}
          >
            Sair da conta →
          </button>
        </div>

      </div>
    </div>
  );
}
