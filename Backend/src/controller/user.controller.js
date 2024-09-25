import mongoose from 'mongoose'
import {asyncHandler} from '../utils/asynchandler.js'
import {User} from '../models/user.model.js'
import {ApiError} from '../utils/apierror.js'
import {ApiResponse} from '../utils/apiresponce.js'


const registeruser =asyncHandler(async(req,res)=>{
    
    const {username, email, password} = req.body
    
    const existingUser = await User.findOne({email})
    
    if(existingUser){
        res.status(201).json(new ApiResponse(existingUser))
    }
    
    const user = await User.create({username, email, password})
    
    res.status(201).json(new ApiResponse(200,user))
})

export { registeruser}