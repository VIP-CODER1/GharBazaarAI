/*
  AI helper with graceful fallback.
  - If GEMINI_API_KEY or OPENAI_API_KEY is present, we can later enhance with true LLM calls.
  - For now, robust local parsing builds structured filters from natural language queries.
*/

import dotenv from "dotenv";
dotenv.config();

const hasGemini = Boolean(process.env.GEMINI_API_KEY);
const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

async function callGeminiForFilters(rawQuery) {
    if (!hasGemini) return null;
    try {
        // Use configurable model so different projects/keys can target supported models.
        const model = geminiModel;
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
        const prompt = `You are a strict JSON generator for a rental listings search engine.\n\nExtract structured filters from the user's query. ONLY return compact JSON, no commentary.\n\nSchema:{rentMin:number|null,rentMax:number|null,category:string|null,city:string|null,landMark:string|null,ratingMin:number|null}\n\nRules:\n- Convert amounts like 25k -> 25000.\n- ratingMin is a number from 0 to 5 when user asks for 3+, 4 star, etc.\n- Unknown fields MUST be null.\n- Be concise and deterministic.\n\nUserQuery:"${rawQuery}"`;

        const body = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error("Gemini generateContent failed", res.status, text);
            return null;
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        // Try to locate JSON in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
    } catch (err) {
        console.error("Gemini call error:", err?.message || err);
        return null;
    }
}

export async function parseNaturalLanguageQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== "string") {
        return {};
    }

    const query = rawQuery.toLowerCase();

    // Prefer Gemini when available to get structured filters
    const gemini = await callGeminiForFilters(rawQuery);
    if (gemini && typeof gemini === "object") {
        return {
            rentMin: typeof gemini.rentMin === "number" ? gemini.rentMin : undefined,
            rentMax: typeof gemini.rentMax === "number" ? gemini.rentMax : undefined,
            category: gemini.category || undefined,
            city: gemini.city || undefined,
            landMark: gemini.landMark || undefined,
            ratingMin: typeof gemini.ratingMin === "number" ? gemini.ratingMin : undefined,
        };
    }

    // Extract numbers and price hints (e.g., "under 25k", "< 20000", "between 10k and 20k")
    const pricePattern = /(?:under|below|less than|<)\s*(\d+[kK]?)/;
    const minPricePattern = /(?:over|above|more than|>)\s*(\d+[kK]?)/;
    const betweenPattern = /between\s*(\d+[kK]?)\s*(?:and|to)\s*(\d+[kK]?)/;

    const extractNumber = (val) => {
        if (!val) return undefined;
        const normalized = String(val).replace(/k/gi, "000");
        const n = Number(normalized);
        return Number.isFinite(n) ? n : undefined;
    };

    let rentMax;
    let rentMin;
    const between = query.match(betweenPattern);
    if (between) {
        rentMin = extractNumber(between[1]);
        rentMax = extractNumber(between[2]);
    } else {
        const maxM = query.match(pricePattern);
        const minM = query.match(minPricePattern);
        if (maxM) rentMax = extractNumber(maxM[1]);
        if (minM) rentMin = extractNumber(minM[1]);
    }

    // Simple category hints
    const categoryHints = ["apartment", "flat", "house", "villa", "pg", "studio"];
    const category = categoryHints.find((c) => query.includes(c));

    // City and landmark extraction (very naive: looks for "in <word>" and "near <phrase>")
    let city;
    const inCity = query.match(/\bin\s+([a-zA-Z\-\s]{2,})/);
    if (inCity) {
        city = inCity[1].trim();
    }

    let landMark;
    const nearLm = query.match(/\bnear\s+([a-zA-Z0-9\-\s]{2,})/);
    if (nearLm) {
        landMark = nearLm[1].trim();
    }

    // Ratings (e.g., "rating 4+", "at least 3 stars")
    let ratingMin;
    const ratingPlus = query.match(/(?:rating|ratings|star|stars)\s*(\d(?:\.\d)?)\s*\+/);
    const atLeast = query.match(/at least\s*(\d(?:\.\d)?)\s*(?:star|stars|rating|ratings)/);
    if (ratingPlus) ratingMin = Number(ratingPlus[1]);
    if (!ratingMin && atLeast) ratingMin = Number(atLeast[1]);

    return {
        rentMin,
        rentMax,
        category,
        city,
        landMark,
        ratingMin,
    };
}

export async function buildSemanticQuery(filters, rawQuery) {
    // If future: call LLM to refine filters when keys exist
    if (hasGemini || hasOpenAI) {
        // Placeholder for future enhancement; keep deterministic for now.
        // We still return a robust Mongo query.
    }

    const orText = [];
    if (rawQuery && rawQuery.trim().length > 0) {
        // Prefer Mongo text search when index exists; fallback regex handled by caller
        orText.push({ $text: { $search: rawQuery } });
    }

    const andClauses = [];
    if (filters) {
        const { rentMin, rentMax, category, city, landMark, ratingMin } = filters;

        if (typeof rentMin === "number" || typeof rentMax === "number") {
            const rent = {};
            if (typeof rentMin === "number") rent.$gte = rentMin;
            if (typeof rentMax === "number") rent.$lte = rentMax;
            andClauses.push({ rent });
        }
        if (category) {
            andClauses.push({ category: { $regex: category, $options: "i" } });
        }
        if (city) {
            andClauses.push({ city: { $regex: city, $options: "i" } });
        }
        if (landMark) {
            andClauses.push({ landMark: { $regex: landMark, $options: "i" } });
        }
        if (typeof ratingMin === "number") {
            andClauses.push({ ratings: { $gte: ratingMin } });
        }
    }

    // If we have neither text nor structured filters, let caller fallback
    if (orText.length === 0 && andClauses.length === 0) {
        return null;
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};
    if (orText.length > 0) {
        // Combine text search with AND filters
        return Object.keys(query).length > 0 ? { $and: [query, ...orText] } : { $or: orText };
    }
    return query;
}

export function aiCapabilities() {
    return {
        hasGemini,
        hasOpenAI,
    };
}
