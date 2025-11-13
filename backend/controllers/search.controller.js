import Listing from "../model/listing.model.js";
import { parseNaturalLanguageQuery, buildSemanticQuery } from "../services/ai.service.js";

/**
 * A more powerful search controller that handles text, filters, and geospatial queries.
 */
export const searchListings = async (req, res) => {
    try {
        const {
            q, // natural language query
            category,
            city,
            landMark,
            rentMin,
            rentMax,
            ratingMin,
            // Geospatial query params
            lat, // latitude
            lon, // longitude
            radius, // radius in kilometers
        } = req.query;

        let filters = {
            category,
            city,
            landMark,
            rentMin: rentMin ? Number(rentMin) : undefined,
            rentMax: rentMax ? Number(rentMax) : undefined,
            ratingMin: ratingMin ? Number(ratingMin) : undefined,
        };

        // If a natural language query 'q' is provided, use the AI service to parse it
        if (q) {
            const naturalFilters = await parseNaturalLanguageQuery(q);
            // Merge natural language filters with explicit query params. Explicit params take precedence.
            filters = { ...naturalFilters, ...filters };
        }

        // Build the main query object from filters
        const mongoQuery = await buildSemanticQuery(filters, q);

        // --- Geospatial Query Logic ---
        // If lat, lon, and radius are provided, add a geospatial clause to the query.
        // This requires the 'location' field and a '2dsphere' index on the Listing model.
        if (lat && lon && radius) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            const searchRadiusKm = parseFloat(radius);

            if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(searchRadiusKm)) {
                const geoClause = {
                    location: {
                        $geoWithin: {
                            $centerSphere: [
                                [longitude, latitude],
                                searchRadiusKm / 6378.1 // Convert distance to radians (Earth's radius in km)
                            ]
                        }
                    }
                };

                // If a query already exists, combine it with the geo clause
                if (mongoQuery && Object.keys(mongoQuery).length > 0) {
                    if (mongoQuery.$and) {
                        mongoQuery.$and.push(geoClause);
                    } else {
                        // If there's no $and, create one
                        const existingQuery = { ...mongoQuery };
                        delete mongoQuery.$or; // clean up if it exists
                        mongoQuery.$and = [existingQuery, geoClause];
                    }
                } else {
                    // If no other query, the geo clause is the main query
                    Object.assign(mongoQuery, geoClause);
                }
            }
        }

        // Fallback to a regex search on multiple fields if no query could be built
        if (!mongoQuery || Object.keys(mongoQuery).length === 0) {
            if (q) {
                const regex = { $regex: q, $options: "i" };
                const listings = await Listing.find({
                    $or: [{ title: regex }, { description: regex }, { city: regex }, { landmark: regex }]
                });
                return res.status(200).json(listings);
            }
            // If no query and no 'q', return all listings
            const allListings = await Listing.find({});
            return res.status(200).json(allListings);
        }

        const listings = await Listing.find(mongoQuery);

        res.status(200).json(listings);

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "An error occurred during search." });
    }
};