import dotenv from "dotenv";
import Listing from "../model/listing.model.js";

dotenv.config();

const hasGemini = Boolean(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body || {};
        if (!message || typeof message !== "string") {
            return res.status(400).json({ message: "'message' is required" });
        }

        // --- START: New Hardcoded Q&A Logic ---

        // An array of [RegExp, Answer] pairs for flexible matching.
        const predefinedQA = [
            // Greetings
            [/^(hi|hey|hello)$/, "Hi! I can help you search properties (try: '2BHK near metro under 25k'), understand pricing, and guide you around GharBazaar. Ask me anything!"],

            // General Platform Questions
            [/what.*is.*gharbazaar/, 'GharBazaar is a digital marketplace connecting property owners with tenants. You can list your property for rent, or browse and book properties from others!'],
            [/free.*list.*property/, 'Yes, listing your property on GharBazaar is completely free! We aim to make it as easy as possible for owners to find tenants.'],
            [/are.*properties.*verified/, "Property owners are responsible for the accuracy of their listings. We encourage users to read reviews and communicate with the host. We are working on a verification system to enhance trust and safety on the platform."],

            // How-To & Feature Questions
            [/how.*list.*property/, "To list your property, please log in and click on the 'Add your home' button in the navigation bar. You'll be guided through a simple form to add details and photos."],
            [/how.*book.*(room|property|house)/, 'To book a property, simply browse our listings, find one you like, and click on it to view details. On the property page, you will find an option to select your dates and proceed with the booking.'],
            [/how.*contact.*(owner|host)/, "Once your booking is confirmed, you will receive the property owner's contact information. For privacy reasons, we do not share contact details before a booking is made."],
            [/what.*happens.*after.*book/, "After you book a property, the owner will be notified. They will then contact you to confirm the details and arrange for key handover and payment. You can see your booking details under the 'My Booking' section."],
            [/cancellation.*policy/, "Cancellation policies are set by individual property owners. Please check the listing details or contact the owner for specific cancellation information before booking."],
            [/what.*summarize.*button/, "The 'Summarize' button uses AI to give you a quick overview of the properties you are currently viewing. It highlights the variety, price range, and key locations to help you make a faster decision!"],
            [/summarize.*(listings|rooms|properties)/, "You can get an AI-powered summary of the current listings by clicking the 'Summarize' button at the top of the page. It's a great way to get a quick overview!"],

            // User Support
            [/suggest.*(room|property|house)/, 'I can certainly help with that! To give you the best suggestions, could you please tell me which city or area you are looking in? For example, try asking "suggest rooms in Kota".'],
            [/forgot.*password/, "No problem. On the login page, you can find a 'Forgot Password' link. Click on it and follow the instructions to reset your password."],
        ];

        const normalizedMessage = message.toLowerCase().trim().replace(/[?]/g, '');
        
        for (const [regex, answer] of predefinedQA) {
            if (regex.test(normalizedMessage)) {
                return res.status(200).json({ reply: answer });
            }
        }

        // If the question is not in our predefined list, give a default response.
        const defaultReply = "Thank you for your question! We are constantly improving our AI assistant, and this feature is currently under development. Please try asking about our platform or how to use it.";
        return res.status(200).json({ reply: defaultReply });

        // --- END: New Hardcoded Q&A Logic ---
    } catch (error) {
        console.error("Chat endpoint error:", error?.message || error);
        return res.status(500).json({ message: "Chat error" });
    }
};

export const ping = async (req, res) => {
    try {
        return res.status(200).json({ ok: true, service: "ai", hasGemini });
    } catch (e) {
        return res.status(500).json({ ok: false });
    }
}

export const test = async (req, res) => {
    try {
        if (!hasGemini) return res.status(400).json({ ok: false, message: "GEMINI_API_KEY not set" });

        // Use configurable model name (set GEMINI_MODEL in .env) so we can adapt to allowed models.
        const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
        const body = {
            contents: [
                { role: "user", parts: [{ text: "Respond with a single word: hello" }] }
            ]
        };

        const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const text = await r.text();

        if (!r.ok) {
            // If generateContent failed (for example model not supported), return the error plus ListModels for debugging.
            let listModels = null;
            try {
                const listEndpoint = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
                const lm = await fetch(listEndpoint);
                listModels = await lm.text();
            } catch (e) {
                listModels = `ListModels call failed: ${String(e?.message || e)}`;
            }

            return res.status(r.status).json({ ok: false, error: text, availableModels: listModels });
        }

        return res.status(200).send(text);
    } catch (e) {
        return res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
}

const generateHardcodedSummary = (listings, category) => {
    const count = listings.length;
    if (count === 0) {
        return "There are no properties in this category to summarize right now.";
    }

    // 1. Analyze the listings data
    const rents = listings.map(l => l.rent);
    const minRent = Math.min(...rents).toLocaleString('en-IN');
    const maxRent = Math.max(...rents).toLocaleString('en-IN');

    const locations = listings.map(l => l.city);
    const locationCounts = locations.reduce((acc, loc) => {
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
    }, {});
    const commonLocation = Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b, 'the area');

    const categoryName = category === 'trending' ? 'properties' : `${category.replace(/s$/, '')}s`;

    // 2. Define summary templates
    const templates = [
        `We've found a great selection of ${count} ${categoryName} for you. You can find options with rents ranging from ₹${minRent} to ₹${maxRent}, primarily located around ${commonLocation}. It's a great time to explore these choices!`,
        `Currently, there are ${count} exciting ${categoryName} available. Prices are competitive, starting from just ₹${minRent}, with options available in popular areas like ${commonLocation}. Dive in and find your perfect match!`,
        `Exploring the ${categoryName}? We have ${count} listings ready for you, with a price range of ₹${minRent} to ₹${maxRent}. Many of these are concentrated in the vibrant ${commonLocation} area, offering a great mix of choices.`,
        `Right now, you're viewing ${count} fantastic ${categoryName}. With prices between ₹${minRent} and ₹${maxRent} in the ${commonLocation} region, there's something for every budget. Happy hunting!`
    ];

    // 3. Pick a random template to feel less static
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
};

export const summarizeListings = async (req, res) => {
    const { category } = req.body;

    try {
        // 1. Fetch listings from the database based on the category.
        let listings;
        if (category && category !== "trending") {
            listings = await Listing.find({ category }).limit(20).lean();
        } else {
            // For "trending" or no category, fetch the most recent listings.
            listings = await Listing.find({}).sort({ createdAt: -1 }).limit(20).lean();
        }

        if (!listings || listings.length === 0) {
            return res.status(200).json({ summary: "There are no properties in this category to summarize right now." });
        }

        // --- START: New Hardcoded Summary Logic ---
        const summaryText = generateHardcodedSummary(listings, category || 'trending');
        return res.status(200).json({ summary: summaryText });
        // --- END: New Hardcoded Summary Logic ---

    } catch (error) {
        console.error("Listing summarization error:", error.message);
        return res.status(500).json({ message: "Sorry, I couldn't generate a summary right now." });
    }
};
