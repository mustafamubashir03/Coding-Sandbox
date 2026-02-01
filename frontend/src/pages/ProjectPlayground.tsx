import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent"

const ProjectPlayground = () => {
    const {projectId} = useParams()
    console.log(projectId)
  return (
    <div>
        <EditorComponent/>
    </div>
  )
}

export default ProjectPlayground