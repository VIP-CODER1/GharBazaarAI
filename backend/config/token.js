import jwt from "jsonwebtoken"

const genToken= async (userId) => {
    try {
        const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me"
        if (!process.env.JWT_SECRET) {
            console.warn("JWT_SECRET not set. Using development default secret.")
        }
        let token = await jwt.sign({userId}, secret, {expiresIn:"7d"})
        return token
    } catch (error) {
        console.error("token error:", error?.message || error)
    }
    
}
export default genToken