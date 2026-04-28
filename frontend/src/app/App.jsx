import { RouterProvider } from "react-router-dom"
import { router } from "../routes.jsx"
import "./app.css"

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App