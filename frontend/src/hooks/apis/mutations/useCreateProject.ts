import { useMutation } from "@tanstack/react-query"
import { createProject } from "../../../apis/projects"
import { useNavigate } from "react-router-dom"


export const useCreateProject = ()=>{
    const navigate = useNavigate()
    const {isError,isPending, isSuccess, mutateAsync:createProjectMutation} = useMutation({
        mutationFn: createProject, 
        onSuccess:(data)=>{
            console.log("Successfully created the project")
            console.log(data)
            navigate(`/projects/${data.data}`)
        },
        onError:(err)=>{
            console.log("Error creating the project",err)
        }

    })

    return ({
        createProjectMutation,
        isSuccess,
        isError,
        isPending
    })
}