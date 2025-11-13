import express from "express";
import {
    chat,
    ping,
    test,
    summarizeListings
} from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chat);
aiRouter.get("/ping", ping);
aiRouter.get("/test", test);
aiRouter.post("/summarize", summarizeListings);

export default aiRouter;