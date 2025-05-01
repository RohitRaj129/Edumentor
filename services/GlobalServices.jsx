import axios from "axios"

export const getToken=async()=>{
    const result=await axios.get('/api/getToken')
    return result.data
}