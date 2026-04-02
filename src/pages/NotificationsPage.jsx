import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  async function load() {
    setStatus("loading");
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setStatus("error");
      setError("No hay sesión activa");
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, read, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    setItems(data || []);
    setStatus("ready");
  }

  useEffect(() => {
    let channel;
    (async () => {
      await load();

      // Realtime: refresca si cambia algo en notifications
      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications" },
          () => load(),
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  async function markAsRead(id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    await load();
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <p className="text-gray-600">Cargando notificaciones...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="font-medium text-red-700">Error</p>
        <p className="mt-1 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
        </div>
        <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
          Sin leer: {unread}
        </span>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-700">Aún no hay notificaciones.</p>
          <p className="mt-1 text-sm text-gray-500">
            Presiona “Probar push” para generar una.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <article
              key={n.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                n.read ? "border-gray-100" : "border-pink-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(n.created_at).toLocaleString("es-MX")}
                  </p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="rounded-xl bg-pink-500 px-3 py-2 text-xs font-medium text-white hover:bg-pink-600"
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
