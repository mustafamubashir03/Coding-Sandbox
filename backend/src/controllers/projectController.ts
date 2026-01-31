import util from "node:util"
import uuid4 from "uuid4"
import child_process from "node:child_process"
import fs from "fs/promises"
import { Request,Response } from "express"

const execPromisified = util.promisify(child_process.exec)

export const createProjectController = async(req:Request,res:Response)=>{
    const projectId = uuid4()
    console.log("New project id is ",projectId)
    await fs.mkdir(`./projects/${projectId}`, { recursive: true })
    const response = await execPromisified(`npm create vite@latest sandbox -- --template react`, {
        cwd:`./projects/${projectId}`
    })
    return res.json({message:'Project created', data:projectId})

}