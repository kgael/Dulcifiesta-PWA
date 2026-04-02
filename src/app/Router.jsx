import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '../routes/RequireAuth'
import RequireAdmin from '../routes/RequireAdmin'

import LoginPage from '../pages/LoginPage'
import CatalogPage from '../pages/CatalogPage'
import NotificationsPage from '../pages/NotificationsPage'
import InventoryPage from '../pages/InventoryPage'
import MovementsPage from '../pages/MovementsPages'
import CreateProductPage from '../pages/CreateProductPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Home siempre manda a catálogo (público) */}
      <Route path="/" element={<Navigate to="/catalog" replace />} />

      {/* Público */}
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Privado */}
      <Route element={<RequireAuth />}>
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Admin */}
        <Route element={<RequireAdmin />}>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/products/new" element={<CreateProductPage />} />
        </Route>
      </Route>

      {/* Cualquier cosa rara -> catálogo */}
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}
