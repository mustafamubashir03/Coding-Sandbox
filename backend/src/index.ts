import express from "express"
import cors from "cors"
import { PORT } from "./config/serverConfig.js"
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

app.get('/health',(req,res)=>{
    res.json({server:"ok"})
})

app.listen(PORT,()=>{
    console.log("Server has been started at port",PORT)
})



