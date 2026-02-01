import { Route, Routes } from "react-router-dom"
import CreateProject from "./pages/CreateProject.js"
import ProjectPlayground from "./pages/ProjectPlayground.js"


const Router = () => {
  return (
    <Routes>
    <Route path="/" element={<CreateProject/>}/>
    <Route path="/projects/:projectId" element={<ProjectPlayground/>}/>
  </Routes>
  )
}

export default Router