# eCommerce Platform - Project Documentation

## Project Overview
This is a full-stack eCommerce platform built with React (frontend) and Express.js/Node.js (backend) that allows users to buy and sell products, manage inventory, and participate in a dice gambling game. The backend uses Oracle Database for persistent data storage.

---

## 📁 Project Structure

### Root Level Files
- **package.json** - React frontend project configuration with dependencies (React, Tailwind CSS, testing libraries)
- **tailwind.config.js** - Tailwind CSS framework configuration for styling
- **postcss.config.js** - PostCSS configuration for processing CSS with Autoprefixer
- **README.md** - Project overview and setup instructions

---

## 🎨 Frontend (React Application)

### Main Entry Points
- **src/index.js** - React app entry point that renders the App component into the DOM
- **src/index.css** - Global CSS styles for the application
- **public/index.html** - Main HTML file that serves as the app container

### Core Application
- **src/App.js** - Main React component handling:
  - User authentication state management (login/logout)
  - Navigation between different pages (Shop, Sell, Gambling, My Products)
  - Product inventory management
  - Shopping cart functionality
  - Automated purchase simulation (every 60 seconds)
  - Dice gambling game logic
  - Data persistence using localStorage
  - Balance management for users

### Components
Located in `src/components/`:

1. **Header.js** - Navigation header displaying:
   - Current logged-in user
   - User's account balance
   - Logout button

2. **LoginPage.js** - Authentication interface with:
   - Username and password input fields
   - Toggle between Login and Sign Up modes
   - User credential validation

3. **ProtectedRoute.js** - Route protection component for authenticated pages

### Pages
Located in `src/pages/`:

1. **ShopPage.js** - Main marketplace displaying:
   - List of all available products
   - Product details (name, price, stock, seller name)
   - Add to cart functionality
   - Shopping cart summary with checkout

2. **SellPage.js** - Product listing interface allowing users to:
   - Enter product name
   - Set product price
   - Write product description
   - Specify stock quantity
   - List products to the marketplace

3. **GamblingPage.js** - Dice rolling game where users can:
   - Place bets (betAmount)
   - Select a number (1-6)
   - Roll the dice
   - Win 5x their bet if they guess correctly
   - Lose their bet if they guess incorrectly

4. **MyProductsPage.js** - Dashboard showing:
   - Products listed by the current user
   - Sales statistics (total sold, revenue)
   - Current stock levels
   - Price and listing date information

### Utilities
- **src/utils/storage.js** - localStorage wrapper functions for:
  - Saving/loading user data
  - Saving/loading product data
  - Managing current logged-in user session

### API Client
- **src/api.js** - Centralized API communication utility:
  - `apiFetch()` function for all HTTP requests (GET, POST, PUT, DELETE)
  - Handles JWT token in Authorization header
  - Centralized error handling and JSON parsing
  - Base URL configuration for backend endpoint

---

## 🔧 Backend (Express.js Server)

### Configuration
- **backend/package.json** - Backend dependencies:
  - Express.js (web framework)
  - bcrypt (password hashing)
  - jsonwebtoken (JWT authentication)
  - cors (cross-origin requests)
  - dotenv (environment variables)
  - oracledb (Oracle database driver)

- **backend/server.js** - Express server setup:
  - Initialize CORS for frontend communication
  - Parse JSON request bodies
  - Register route handlers
  - Health check endpoint (`/api/health`)
  - Database initialization on startup
  - Graceful shutdown on SIGINT

### Database Configuration
- **backend/config/database.js** - Oracle Database connection management:
  - Creates connection pool with min 2 and max 10 connections
  - Initializes Oracle client in thick mode
  - Provides pool management and cleanup

### Authentication Routes
- **backend/routes/auth.js** - User authentication endpoints:
  - `POST /api/auth/signup` - Create new user with hashed password, initial balance of $2000
  - `POST /api/auth/login` - Authenticate user and return JWT token
  - `GET /api/auth/balance` - Fetch current user balance (requires JWT token)
  - Uses bcrypt for password hashing
  - Uses JWT for session tokens (24-hour expiry)

### Product Management Routes
- **backend/routes/products.js** - Product management endpoints:
  - `GET /api/products` - Retrieve all products with stock > 0
  - `POST /api/products` - Create new product (requires authentication)
  - `GET /api/products/user/:userId` - Get products listed by specific user
  - Seller ID automatically extracted from JWT token
  - Stock tracking and join with user data

### Transaction & Checkout Routes
- **backend/routes/transactions.js** - Purchase and transaction processing (current implementation):
  - `POST /api/transactions/checkout` - Process product purchase (requires authentication)
    - Request body: `{ cartItems: [{ productId, name, price, quantity, sellerId }, ...] }`
    - Verifies buyer's balance, updates product `stock` and `total_sold`, credits seller balances, inserts `transactions` records, deducts total from buyer, commits transaction.
    - Returns: `{ message: 'Purchase successful', newBalance: <number> }` on success.
  - Notes: The current `transactions.js` implementation focuses on `checkout`. Other endpoints such as `update-balance` or a global `GET /api/transactions` are not present in this file; add them if you need balance-only adjustments or an admin transaction listing.
  - Error handling: rolls back and returns 400 for out-of-stock or insufficient funds, 500 for server errors.

### Shopping Cart Routes
- **backend/routes/cart.js** - Shopping cart operations:
  - `GET /api/cart/:userId` - Retrieve cart items for user
  - `POST /api/cart` - Add item to cart
  - `PUT /api/cart/:cartItemId` - Update cart item quantity/options
  - `DELETE /api/cart/:cartItemId` - Remove item from cart

### Product Categories Routes
- **backend/routes/categories.js** - Category management:
  - `GET /api/categories` - List all product categories
  - `POST /api/categories` - Create new category
  - `PUT /api/categories/:categoryId` - Update category
  - `DELETE /api/categories/:categoryId` - Delete category

### Orders Management Routes
- **backend/routes/orders.js** - Order tracking:
  - `GET /api/orders` - Retrieve all orders with status and details
  - `POST /api/orders` - Create new order
  - `PUT /api/orders/:orderId` - Update order status
  - `DELETE /api/orders/:orderId` - Cancel/delete order

### Product Reviews Routes
- **backend/routes/reviews.js** - Review system:
  - `GET /api/reviews/product/:productId` - Get reviews for a product
  - `POST /api/reviews` - Add review with rating (1-5) and comment
  - `PUT /api/reviews/:reviewId` - Update existing review
  - `DELETE /api/reviews/:reviewId` - Delete review

### Middleware
- **backend/middleware/auth.js** - JWT authentication middleware:
  - Extracts token from Authorization header (Bearer scheme)
  - Verifies token validity using JWT_SECRET
  - Attaches decoded user data to request object
  - Returns 401 if no token provided
  - Returns 403 if token is invalid

---

## 🗄️ Database Schema (Oracle Database)

### Core Tables

**users table**
- `user_id` - Primary key (auto-incremented via user_seq)
- `username` - Unique username
- `password` - Hashed password (bcrypt)
- `balance` - User's account balance (initial: $2000)
- `created_at` - Account creation timestamp

**products table**
- `product_id` - Primary key (auto-incremented via product_seq)
- `seller_id` - Foreign key to users table
- `name` - Product name
- `description` - Product details
- `price` - Product price (decimal)
- `stock` - Available quantity
- `total_sold` - Units sold counter
- `listed_at` - Product listing timestamp
- `category_id` - Foreign key to categories (optional)

**transactions table**
- `transaction_id` - Primary key (auto-incremented via transaction_seq)
- `buyer_id` - Foreign key to users
- `seller_id` - Foreign key to users
- `product_id` - Foreign key to products
- `amount` - Transaction amount
- `transaction_date` - When the purchase occurred

### Extended Tables

**cart_items table**
- `cart_item_id` - Primary key
- `user_id` - Foreign key to users
- `product_id` - Foreign key to products
- `quantity` - Number of items in cart
- `selected_options` - JSON or VARCHAR for product options

**categories table**
- `category_id` - Primary key
- `name` - Category name
- `description` - Category description

**orders table**
- `order_id` - Primary key
- `user_id` - Foreign key to users
- `product_id` - Foreign key to products
- `quantity` - Order quantity
- `total_amount` - Order total
- `status` - Order status (pending, shipped, delivered, cancelled)
- `ordered_at` - Order timestamp

**reviews table**
- `review_id` - Primary key
- `user_id` - Foreign key to users
- `product_id` - Foreign key to products
- `rating` - Rating (1-5)
- `comment` - Review comment text
- `created_at` - Review creation timestamp

---

## 🔄 Application Features & Workflows

### 1. User Authentication
- **Sign Up**: Creates new user with username, password (hashed), and initial $2000 balance
- **Login**: Validates credentials and creates user session
- **Logout**: Clears session and returns to login screen

### 2. Product Management
- **List Products**: Users can list products with name, price, description, and stock
- **View Products**: Browse all available products in the shop
- **My Products**: View products you've listed and sales statistics
- **Stock Tracking**: Real-time stock updates as products are purchased

### 3. Shopping System
- **Add to Cart**: Add products to shopping cart (can't add own products)
- **Remove from Cart**: Remove items before checkout
- **Checkout**: Purchase all cart items if sufficient balance
- **Out of Stock**: Users can't purchase out-of-stock items

### 4. Automated Purchases
- **Every 60 seconds**: System simulates purchases from other users
- **Probability-based**: Lower prices have higher purchase probability
- **Seller Rewards**: Sellers receive payment immediately when product is purchased
- **Automatic Stock Deduction**: Stock decreases with each purchase

### 5. Gambling (Dice Game)
- **Bet Placement**: Users place bets and select a number (1-6)
- **Dice Roll**: Randomized roll outcome
- **Winning**: Correct guess rewards 5x the bet amount
- **Losing**: Incorrect guess deducts the bet amount
- **Balance Validation**: Can't bet more than account balance

### 6. Data Persistence
- **localStorage**: Frontend stores users, products, and current session in browser storage
- **Oracle Database**: Backend stores authenticated user data and transactions
- **Real-time Sync**: Data updates immediately across all application states

---

## 🚀 How to Run

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# DB_USER=your_oracle_user
# DB_PASSWORD=your_oracle_password
# DB_CONNECTION_STRING=your_oracle_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

npm start        # or npm run dev for development with nodemon
```

### Frontend Setup
```bash
npm install
npm start        # Runs on http://localhost:3000
```

### Environment Variables (.env in backend/)
- `DB_USER` - Oracle database user
- `DB_PASSWORD` - Oracle database password
- `DB_CONNECTION_STRING` - Oracle connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 5000)

---

## 📊 Key Technologies

### Frontend
- **React** (v19.2.0) - UI framework
- **Tailwind CSS** (v3.4.18) - Styling framework
- **Lucide React** - Icon library
- **localStorage** - Client-side data persistence (deprecated, now uses backend)

### Backend
- **Express.js** (v5.1.0) - Web framework (upgraded to v5)
- **Node.js** - Runtime environment
- **Oracle Database** (oracledb v6.10.0) - Primary data store
- **bcrypt** (v6.0.0) - Password hashing
- **JWT** (jsonwebtoken v9.0.2) - Authentication tokens
- **CORS** (v2.8.5) - Cross-origin request handling
- **dotenv** (v17.2.3) - Environment variable management

---

## 🔐 Security Features
- Password hashing with bcrypt
- JWT-based authentication (24-hour tokens)
- CORS protection for API endpoints
- User balance validation before transactions
- Protection against self-purchasing

---

## 🔄 API Request Flow

### Authentication Flow
1. User submits login credentials from LoginPage.js
2. Frontend calls `apiFetch('/auth/login', 'POST', credentials)`
3. Backend validates against database using bcrypt
4. Returns JWT token on success
5. Token stored in frontend state
6. All subsequent requests include token in Authorization header

### Product Purchase Flow
1. User adds items to cart (client-side state)
2. User clicks checkout
3. Frontend sends cart to `/transactions/checkout` with JWT token
4. Backend verifies user balance
5. Updates product stock and seller balance in database
6. Records transaction
7. Returns updated balance to frontend

### Protected Route Pattern
- All routes requiring authentication check JWT token via middleware
- Middleware extracts userId from token
- User data attached to request object (req.user)
- Unauthorized requests receive 401/403 status

---

## 📝 Architecture Notes

### Recent Migration
- **From**: localStorage-only data persistence
- **To**: Backend-driven with OAuth-style JWT authentication
- **Benefits**: Persistent data, multi-device support, security
- **Status**: In progress - Some frontend features still use localStorage

### Data Persistence Strategy
- **Transactional Data**: Stored in Oracle Database (purchases, users, products)
- **Session Data**: JWT tokens (stateless authentication)
- **Cart Data**: Can be client-side or database (cart_items table available)
- **Non-critical Data**: Optional localStorage for UI optimization

### Security Implementation
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with 24-hour expiration
- Token required in Authorization header as: `Bearer <token>`
- Connection pooling prevents database exhaustion
- Input validation on all API endpoints

### Scalability Considerations
- Oracle connection pool (min: 2, max: 10 connections)
- Stateless backend (can scale horizontally)
- JWT tokens eliminate session storage overhead
- Indexed database lookups on user_id and product_id

### Development Notes
- Initial user balance: $2000 USD
- All monetary values in USD format
- Automated purchase simulation (every 60 seconds) in frontend
- Database initialization required before backend startup
- .env file must contain valid Oracle credentials
