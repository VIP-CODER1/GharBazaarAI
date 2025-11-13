import genToken from "../config/token.js"
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

export const sighUp=async (req,res) => {
    try {
        let {name,email,password} = req.body
        if(!name || !email || !password){
            return res.status(400).json({message:"name, email and password are required"})
        }
        let existUser = await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"User is already exist"})
        }
        let hashPassword = await bcrypt.hash(password,10)
        let user = await User.create({name , email , password:hashPassword})
        let token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(201).json(user)

    } catch (error) {
        console.error("signup error:", error?.message || error)
        return res.status(500).json({message:"signup error"})
    }
}

export const login = async (req,res) => {
    try {
        let {email,password} = req.body
        if(!email || !password){
            return res.status(400).json({message:"email and password are required"})
        }
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({message: "database not connected"})
        }
        let user= await User.findOne({email}).populate("listing","title image1 image2 image3 description rent category city landMark")
        if(!user){
            return res.status(400).json({message:"User is not exist"})
        }
        let isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect Password"})
        }
        let token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json(user)
        
    } catch (error) {
        console.error("login error:", error?.message || error)
        return res.status(500).json({message:"login error"})
    }
}

export const logOut = async (req,res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: true,
            sameSite: "none"
        });
        return res.status(200).json({message:"Logout Successfully"})
    } catch (error) {
        console.error("logout error:", error?.message || error)
        return res.status(500).json({message:"logout error"})
    }
}
