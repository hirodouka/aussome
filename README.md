# Ultras. — Full-Stack Fashion E-Commerce & Admin Platform

A high-end, responsive online clothing store built with a **Node.js/Express backend API** and a **React + Vite frontend**. Designed after modern fashion e-commerce storefronts with support for PC and mobile views.

---

## 🌟 Key Features

1. **Storefront Layout & Aesthetics** (Matching screenshot design):
   - **Announcement Bar**: Free shipping indicator and support info.
   - **Navbar**: Brand header (`Ultras.`), main collections (*Women, Men, Kids, Accessories, Collections, Sale*), Wishlist badge, Cart drawer toggle, Search modal.
   - **Hero Carousel Banner**: *"Summer Collection."* headline and CTA.
   - **Featured Products**: Interactive cards with badges (*New*, *Sale*, *Hot*), price strike-through, image hover overlay (*Add to Cart*, *Quick View*).
   - **Promo Collection Banners**: *"Street Wear"*, *"Basic Shoes"*, and *"The Casual Selection"*.
   - **Flash Sales & Live Ticking Countdown**: Live countdown timer (*Days : Hours : Mins : Secs*) with discounted products.
   - **Quote of the Day**: Quotation section with author attribution.
   - **Our Journal**: Article grid with read times and fashion insights.
   - **Shopping Cart Drawer**: Slide-over drawer with live price totals, shipping calculator, item quantity adjustments, and checkout simulator.
   - **Quick View Modal**: Product zoom modal with size/color selection.

2. **Admin Catalog & Product Management** (Requested by user):
   - **Admin Portal**: Accessible via the "Admin Portal" button in the top navigation bar.
   - **Add New Clothing**: Form to list new items with Title, Selling Price, Original Price, Category, Badge, Image URL, Description, and Flash Sale flag.
   - **Edit Clothing Details**: Inline edit form to change pricing, titles, or categories.
   - **Delete Product**: Quick action to remove items from the store.
   - **Persistent Storage**: All catalog changes made in the Admin Portal update the backend database (`backend/src/data/products.json`).

3. **Backend REST API**:
   - `GET /api/products` (Product list with category & search filtering)
   - `POST /api/products` (Admin create product)
   - `PUT /api/products/:id` (Admin update product)
   - `DELETE /api/products/:id` (Admin delete product)
   - `GET /api/categories`
   - `GET /api/journal`
   - `POST /api/orders` (Order checkout handler)

---

## 🚀 How to Run Locally

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
> The backend server will start at `http://localhost:5000` (or the port defined in `.env`).

### 2. Start the Frontend React App
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The frontend application will start at `http://localhost:5173`.

---

## ⚙️ Environment Variables Configuration (`.env`)

### Backend (`backend/.env`)
Create or edit `backend/.env` with your production backend variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_KEY=admin123
```

### Frontend (`frontend/.env`)
Create or edit `frontend/.env` with your frontend variables:
```env
VITE_API_URL=http://localhost:5000/api
```
