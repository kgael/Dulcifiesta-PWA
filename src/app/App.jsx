import MainLayout from '../layouts/MainLayout.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import AppRouter from './Router.jsx'

export default function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </AuthProvider>
  )
}
