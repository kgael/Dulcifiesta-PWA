import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthForm from "../components/auth/AuthForm";
import { useAuth } from "../context/AuthContext";
import CatalogPage from "./CatalogPage";
import InventoryPage from "./InventoryPage";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("catalog"); // catalog | inventory | home

  if (loading) {
    return (
      <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600">Cargando sesión...</p>
      </section>
    );
  }

  if (!user) return <AuthForm />;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Sesión activa</p>
          <p className="font-medium text-gray-800">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("catalog")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              tab === "catalog"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Catálogo
          </button>

          <button
            onClick={() => setTab("home")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              tab === "home"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Cerrar sesión
          </button>

          <button
            onClick={() => setTab("inventory")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              tab === "inventory"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Inventario
          </button>
        </div>
      </div>

      {tab === "catalog" ? (
        <CatalogPage />
      ) : tab === "inventory" ? (
        <InventoryPage />
      ) : (
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">Inicio</h2>
          <p className="mt-2 text-gray-600">
            Catálogo ya conectado al backend ✅
          </p>
        </section>
      )}
    </section>
  );
}
