import axios from "../config/axiosConfig"


export const getHealth = async()=>{
    try{
        console.log("api ran")
        const response = await axios.get('/health')
        console.log(response.data)
        return response.data

    }catch(error){
        console.log(error)
    }
}