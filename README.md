# 🏠 GharBazaarAI

GharBazaarAI is an AI-enabled real-estate listings and booking platform built with a React frontend and an Express + Node.js backend using MongoDB for persistence. The app provides listing management, search, booking, image uploads (Cloudinary), and AI-powered suggestions and estimation utilities.


## 📸 Screenshots



  ✅✅[**Home Page**]<img width="1901" height="852" alt="image" src="https://github.com/user-attachments/assets/17a7e4b3-7260-4e70-a371-083798c3d0db" />)

  ✅✅[**Login &SignUp Page**](![imgonline-com-ua-twotoone-NMr9d1yWaVhU](https://github.com/user-attachments/assets/413c2277-d803-4e8b-a9b2-da99b9b5d6b8)


  ✅✅[**Listed Homes**] <img width="1897" height="825" alt="image" src="https://github.com/user-attachments/assets/edfd0115-4afb-4989-bbca-9447f0a63349" />

  ✅✅[**Booking successfully**]  ![image](https://github.com/user-attachments/assets/3f67e1db-e7bf-4336-b0be-c9d7995fff38)


llaborate, feel free to fork the repo and submit a pull request. You can also open an issue for bugs or features.



**Repository layout**
- `backend/` : Express API, MongoDB models, Cloudinary integration, AI endpoints
- `frontend/`: React + Vite app with pages, components and contexts

**Live demo**
- If available, provide the deployment URL here.

**Quick links**
- Backend health: `GET /health`
- Main API prefixes: `POST/GET /api/auth`, `/api/user`, `/api/listing`, `/api/booking`, `/api/ai`

---

**Features**
- **Authentication**: JWT-based signup/login and protected routes (`/api/auth`).
- **User management**: User profiles and context-driven auth in the frontend.
- **Listings**: Create, read, update, delete property listings with image uploads (Cloudinary) and `multer` file handling.
- **Search & Filters**: Search listings by location, price and other attributes (`/api/listing`, `/api/search`).
- **Booking flow**: Book properties, view user bookings and listing owner bookings (`/api/booking`).
- **AI utilities**: Chatbot and AI endpoints for suggestions and price estimation (`/api/ai`, `ai.service.js`, `ai.controller.js`).
- **Image storage**: Cloudinary integration with automatic temporary file cleanup.
- **Frontend UX**: Responsive UI, modal components (`EstimateModal`, `SuggestModal`, `MapModal`), reusable components and context providers.

---

**Tech Stack**
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB (mongoose)
- **Storage**: Cloudinary
- **Auth**: JSON Web Tokens (JWT)

---

**Environment variables**
Create a `.env` file in `backend/` with the following keys (names are taken from the code):
- **`MONGODB_URL`**: MongoDB connection string
- **`JWT_SECRET`**: JWT signing secret (default fallback in code used only for dev)
- **`CLOUDINARY_CLOUD_NAME`**: Cloudinary cloud name
- **`CLOUDINARY_API_KEY`**: Cloudinary API key
- **`CLOUDINARY_API_SECRET`**: Cloudinary API secret
- **`FRONTEND_ORIGIN`** (optional): allowed frontend origin for CORS
- **`PORT`** (optional): backend port (defaults to `8000`)

Example `backend/.env`:
```
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/gharbazaar?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=8000
```

---

**Run locally**

1) Backend
```
cd backend
npm install
npm run dev   # starts server with nodemon (default port 8000)
```

2) Frontend
```
cd frontend
npm install
npm run dev   # starts Vite dev server (default port 5173)
```

Open the frontend in your browser (usually `http://localhost:5173`) and ensure `FRONTEND_ORIGIN` in `.env` is set if you need CORS restricted.

---

**API overview**
- `POST /api/auth/signup` — create a user
- `POST /api/auth/login` — login and receive a JWT
- `GET /api/user/me` — get current user (protected)
- `POST /api/listing` — create listing (protected)
- `GET /api/listing` — list & search listings
- `GET /api/listing/:id` — listing details
- `POST /api/booking` — create booking
- `GET /api/booking` — list bookings for user
- `POST /api/ai/*` — AI endpoints used by chatbot and estimate features

Refer to the controllers in `backend/controllers/` for the exact request/response shapes.

---

**Developer notes**
- Image uploads use `multer` to write a temp file which is uploaded to Cloudinary and then removed (`backend/config/cloudinary.js`).
- Database connection expects `MONGODB_URL` (`backend/config/db.js`).
- JWTs are generated in `backend/config/token.js` and expire in 7 days by default.

---

**Contributing**
- Fork the repository, create a feature branch, add tests if applicable, and open a pull request.

**Author**
- Vipul Kumar — contact: `vipulmth1@gmail.com`

If you want, I can also add a short CONTRIBUTING.md, API reference, or a developer quick-start script. Which would you like next?


