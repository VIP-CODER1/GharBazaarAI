import uploadOnCloudinary from "../config/cloudinary.js";
import { buildSemanticQuery, parseNaturalLanguageQuery } from "../services/ai.service.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";


// A simple geocoding helper function
async function geocodeAddress(city, landmark) {
    const address = `${landmark}, ${city}`;
    // Using a free, public geocoding service. For production, consider a service with an API key.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'GharBazaar/1.0' } // Nominatim API requires a User-Agent header
        });
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return {
                type: 'Point',
                coordinates: [parseFloat(lon), parseFloat(lat)] // GeoJSON format: [longitude, latitude]
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

export const addListing = async (req,res) => {
    try {
        let host = req.userId;
        let {title,description,rent,city,landMark,category} = req.body
        const location = await geocodeAddress(city, landMark);
        // If geocoding fails, do NOT block creation — save listing without location and warn in server logs.
        if (!location) {
            console.warn(`Geocoding failed for address: ${landMark}, ${city}. Saving listing without location.`)
        }
        // Validate uploaded files
        if (!req.files || !req.files.image1 || !req.files.image2 || !req.files.image3) {
            return res.status(400).json({ message: 'Please upload three images (image1, image2, image3).' })
        }

        let image1 = await uploadOnCloudinary(req.files.image1[0].path)
        let image2 = await uploadOnCloudinary(req.files.image2[0].path)
        let image3 = await uploadOnCloudinary(req.files.image3[0].path)

        let listing = await Listing.create({
            title,
            description,
            rent,
            city,
            landMark,
            category,
            image1,
            image2,
            image3,
            host,
            location // Save the geocoded location
        })
        let user = await User.findByIdAndUpdate(host,{$push:{listing:listing._id}},{new:true})

        if(!user){
          return  res.status(404).json({message:"user is not found "})
        }
        return res.status(201).json(listing)
       

    } catch (error) {
        return res.status(500).json({message:`AddListing error ${error}`})
    }
}

export const getListing= async (req,res) => {
    try {
        let listing = await Listing.find().sort({createdAt:-1})
        return res.status(200).json(listing)
    } catch (error) {
        return res.status(500).json({message:`getListing error ${error}`})
    }
    
}

export const findListing= async (req,res) => {
    try {
        let {id}= req.params
        let listing = await Listing.findById(id)
        if(!listing){
            return  res.status(404).json({message:"listing not found"})
        }
        return res.status(200).json(listing)
    } catch (error) {
       return res.status(500).json(`findListing error ${error}`)
    }
    
}
export const updateListing = async (req,res) => {
    try {
        let image1;
        let image2;
        let image3;
        let {id} = req.params;
        let {title,description,rent,city,landMark,category} = req.body
        const location = await geocodeAddress(city, landMark);
        // If geocoding fails on update, continue and update other fields; preserve existing location if present.
        if (!location) {
            console.warn(`Geocoding failed for address on update: ${landMark}, ${city}. Will preserve existing location if any.`)
        }
        if(req.files.image1){
        image1 = await uploadOnCloudinary(req.files.image1[0].path)}
        if(req.files.image2)
        {image2 = await uploadOnCloudinary(req.files.image2[0].path)}
        if(req.files.image3){
        image3 = await uploadOnCloudinary(req.files.image3[0].path)}

        let listing = await Listing.findByIdAndUpdate(id,{
            title,
            description,
            rent,
            city,
            landMark,
            category,
            image1,
            image2,
            image3,
            location // Save the geocoded location on update
        },{new:true})
        
        return res.status(201).json(listing)
       

    } catch (error) {
        return res.status(500).json({message:`UpdateListing Error ${error}`})
    }
}

export const deleteListing = async (req,res) => {
    try {
        let {id} = req.params
        let listing = await Listing.findByIdAndDelete(id)
        let user = await User.findByIdAndUpdate(listing.host,{
            $pull:{listing:listing._id}
        },{new:true})
        if(!user){
            return res.status(404).json({message:"user is not found"})
        }
        return res.status(201).json({message:"Listing deleted"})
    } catch (error) {
        return res.status(500).json({message:`DeleteListing Error ${error}`})
    }
    
}

export const ratingListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { ratings } = req.body;

       

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        listing.ratings = Number(ratings);
        await listing.save();

        return res.status(200).json({ ratings: listing.ratings });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Rating error" });
    }
};

export const search = async (req,res) => {
    try {
        const { query } = req.query;
    
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }
    
        // Try NLP parsing and semantic query building if AI keys are configured
        let filters = await parseNaturalLanguageQuery(query);
        let mongoQuery = await buildSemanticQuery(filters, query);

        // Fallback to robust regex OR text search
        const listing = await Listing.find(mongoQuery ?? {
            $or: [
                { landMark: { $regex: query, $options: "i" } },
                { city: { $regex: query, $options: "i" } },
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ],
        })
        .sort({ createdAt: -1 })
        .limit(100);
    
       return res.status(200).json(listing);
    } catch (error) {
        console.error("Search error:", error);
      return  res.status(500).json({ message: "Internal server error" });
    }
    }
    
