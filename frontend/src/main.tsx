import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App'
import Home from './ui/pages/Home'
import Analyzer from './ui/pages/Analyzer'
import Compare from './ui/pages/Compare'
import About from './ui/pages/About'
import './ui/styles.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: '/analyzer', element: <Analyzer /> },
      { path: '/compare', element: <Compare /> },
      { path: '/about', element: <About /> },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
