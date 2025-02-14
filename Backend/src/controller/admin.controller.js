import Admin from '../models/admin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {ApiResponse} from '../utils/apiresponce.js';

const createAdmin = async (req, res) => {

    
        const { username, email, password,number } = req.body;
        try {  
        if (!username ||!email ||!password || !number) {
            return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
        }
        
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(409).json(new ApiResponse(409, null, "Admin already exists"));
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newAdmin = new Admin({ username, email, password: hashedPassword , number });
        await newAdmin.save();
        return res.status(201).json(new ApiResponse(201, newAdmin, "Admin created successfully"));
    } catch (error) {
        console.log(error);
        
        return res.status(500).json(new ApiResponse(500, null, "Server Error"));
        
    }
}

const getAdmin = async (req, res) => {
    const { email, password} = req.body;

    try {
        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(404).json(new ApiResponse(404, null, "Admin not found"));
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
        }
        
        const token = jwt.sign({ id: admin._id, name:admin.name }, process.env.JWT_SECRET, { expiresIn: '3d' });
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 3 * 24 * 60 * 60 * 1000,
            };
        res.cookie("token", token, options);

        return res.status(200).json(new ApiResponse(200, { token }, "Login successful"));
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Server Error"));
    }

}

const logout = async (req, res) => {
    try {
      // Clear the cookie with matching options as login
        const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
            };
        res.clearCookie("token", options);

        res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
    } catch (error) {
        res
        .status(500)
        .json(new ApiError(500, "Error during logout", error.message));
    }
    };

export { createAdmin, getAdmin, logout };

