import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import userRouter from "./routes/user.route.js"
import listingRouter from "./routes/listing.route.js"
import bookingRouter from "./routes/booking.route.js"
import aiRouter from "./routes/ai.route.js"
let port = process.env.PORT || 8000

let app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    process.env.FRONTEND_ORIGIN,
    // "http://localhost:5173",
   "https://gharbazaarai-537n.onrender.com"
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        // allow non-browser clients like curl, postman (no origin)
        if (!origin) return callback(null, true)

        // allow explicit configured origins
        if (allowedOrigins.includes(origin)) return callback(null, true)

        // during local development allow any localhost origin (handles Vite dynamic ports like 5173/5174)
        if (origin.startsWith('http://localhost')) return callback(null, true)

        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With"]
}))

app.use("/api/auth", authRouter )
app.use("/api/user", userRouter )
app.use("/api/listing",listingRouter )
app.use("/api/booking",bookingRouter )
app.use("/api/ai", aiRouter )

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true, service: "backend", port })
})

// Global error handler to ensure JSON responses for unexpected errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err?.message || err)
    if (res.headersSent) return
    res.status(500).json({ message: "internal server error" })
})


app.listen(port,()=>{
    connectDb()
    console.log(`server started on http://localhost:${port}`)
})
