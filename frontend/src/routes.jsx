import { createBrowserRouter } from 'react-router-dom'
import Home from './home/pages/Home'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    }
])