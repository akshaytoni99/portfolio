import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ContentProvider } from './content/ContentContext.jsx'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE || '/admin-portal'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path={`${ADMIN_ROUTE}/*`}
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route
          path="/*"
          element={
            <ContentProvider>
              <App />
            </ContentProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
