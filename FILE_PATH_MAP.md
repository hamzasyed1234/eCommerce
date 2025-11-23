# eCommerce Project - Complete File Path Map

## Directory Tree Structure

```
eCommerce/
├── .git/                                    # Git repository data
├── .gitignore                              # Git ignore rules
├── node_modules/                           # Frontend dependencies
├── public/                                 # Static public assets
│   ├── favicon.ico                         # Browser tab icon
│   ├── index.html                          # Main HTML entry point
│   ├── logo192.png                         # App logo (192x192)
│   ├── logo512.png                         # App logo (512x512)
│   ├── manifest.json                       # PWA manifest
│   └── robots.txt                          # SEO robots directive
├── src/                                    # React frontend source code
│   ├── App.js                              # Main App component
│   ├── api.js                              # API client helper for backend communication
│   ├── index.js                            # React DOM render entry point
│   ├── index.css                           # Global application styles
│   ├── components/                         # Reusable React components
│   │   ├── Header.js                       # Navigation header component
│   │   ├── LoginPage.js                    # Authentication page component (now calls backend API)
│   │   └── ProtectedRoute.js               # Route protection wrapper
│   ├── pages/                              # Page-level components
│   │   ├── GamblingPage.js                 # Dice gambling game page
│   │   ├── MyProductsPage.js               # User's product listings page
│   │   ├── SellPage.js                     # Product creation/listing page
│   │   └── ShopPage.js                     # Marketplace browsing page
│   └── utils/                              # Utility functions and helpers
│       └── storage.js                      # localStorage wrapper utilities
├── backend/                                # Express.js backend server
│   ├── .env                                # Environment variables (DB config, JWT secret)
│   ├── node_modules/                       # Backend dependencies
│   ├── package.json                        # Backend package configuration
│   ├── package-lock.json                   # Backend dependency lock file
│   ├── server.js                           # Express server entry point
│   ├── config/                             # Configuration files
│   │   └── database.js                     # Oracle Database connection pool setup
│   ├── middleware/                         # Express middleware functions
│   │   └── auth.js                         # JWT authentication middleware
│   └── routes/                             # API endpoint route handlers
│       ├── auth.js                         # Authentication routes (signup, login, balance)
│       ├── cart.js                         # Shopping cart management routes
│       ├── categories.js                   # Product category management routes
│       ├── orders.js                       # Order management routes
│       ├── products.js                     # Product management routes
│       ├── reviews.js                      # Product review management routes
│       └── transactions.js                 # Transaction/purchase history routes
├── package.json                            # Frontend React package configuration
├── package-lock.json                       # Frontend dependency lock file
├── postcss.config.js                       # PostCSS processor configuration
├── tailwind.config.js                      # Tailwind CSS framework configuration
├── README.md                               # Project overview and setup instructions
├── PROJECT_DOCUMENTATION.md                # Detailed feature and component documentation
└── FILE_PATH_MAP.md                        # This file - complete directory structure
```

---

## Detailed File Descriptions

### Root Level Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Specifies which files/folders Git should ignore |
| `.git/` | Git version control metadata |
| `package.json` | Frontend project dependencies and build scripts |
| `package-lock.json` | Locks frontend dependency versions |
| `postcss.config.js` | PostCSS plugin configuration (Autoprefixer) |
| `tailwind.config.js` | Tailwind CSS theme and extension settings |

---

### Public Assets (`public/`)

| File | Purpose |
|------|---------|
| `index.html` | Main HTML template that React renders into |
| `favicon.ico` | Browser tab icon (16x16) |
| `logo192.png` | App logo for PWA (192x192 pixels) |
| `logo512.png` | App logo for PWA (512x512 pixels) |
| `manifest.json` | Progressive Web App manifest configuration |
| `robots.txt` | SEO directive for web crawlers |

---

### Frontend Source Code (`src/`)

#### Main Files
| File | Purpose |
|------|---------|
| `App.js` | Root React component - manages app state, routing, and core logic |
| `index.js` | Entry point - renders App component to DOM |
| `index.css` | Global CSS styles for entire application |

#### Components (`src/components/`)
| File | Purpose |
|------|---------|
| `Header.js` | Top navigation bar showing user info and logout |
| `LoginPage.js` | Authentication form for login/signup |
| `ProtectedRoute.js` | HOC for protecting routes that require authentication |

#### Pages (`src/pages/`)
| File | Purpose |
|------|---------|
| `ShopPage.js` | Marketplace - browse and purchase products |
| `SellPage.js` | List new products for sale |
| `MyProductsPage.js` | View your listed products and sales stats |
| `GamblingPage.js` | Dice rolling game with betting |

#### Utilities (`src/utils/`)
| File | Purpose |
|------|---------|
| `storage.js` | localStorage wrapper for user/product data persistence |

#### API Client (`src/`)
| File | Purpose |
|------|---------|
| `api.js` | Centralized API fetch client for communicating with backend endpoints |

---

### Backend (`backend/`)

#### Root Backend Files
| File | Purpose |
|------|---------|
| `server.js` | Express server initialization and route setup |
| `package.json` | Backend dependencies (Express, bcrypt, JWT, OracleDB) |
| `package-lock.json` | Backend dependency version lock |
| `.env` | Environment variables (DB credentials, JWT secret, PORT) |

#### Configuration (`backend/config/`)
| File | Purpose |
|------|---------|
| `database.js` | Oracle Database connection pool management |

#### Middleware (`backend/middleware/`)
| File | Purpose |
|------|---------|
| `auth.js` | JWT token verification middleware for protected routes |

#### Routes (`backend/routes/`)
| File | Purpose |
|------|---------|
| `auth.js` | Authentication API endpoints (signup, login, balance check) with JWT tokens |
| `products.js` | Product management endpoints (GET all products, POST create, GET user's products) |
| `cart.js` | Shopping cart operations (GET items, POST add, PUT update, DELETE remove) |
| `transactions.js` | Purchase checkout and balance updates with transaction logging |
| `categories.js` | Product category management (GET, POST, PUT, DELETE) |
| `orders.js` | Order management with status tracking (GET, POST, PUT, DELETE) |
| `reviews.js` | Product review system (GET by product, POST, PUT, DELETE) |

---

## File Dependencies & Data Flow

### Frontend Data Flow
```
public/index.html
    ↓
src/index.js (renders App)
    ↓
src/App.js (main state management)
    ├→ src/components/Header.js (display header)
    ├→ src/components/LoginPage.js (auth page)
    ├→ src/utils/storage.js (persist data)
    ├→ src/pages/ShopPage.js (browse products)
    ├→ src/pages/SellPage.js (list products)
    ├→ src/pages/GamblingPage.js (dice game)
    └→ src/pages/MyProductsPage.js (view inventory)
```

### Backend Architecture
```
backend/server.js (Express app)
    ├→ backend/config/database.js (Oracle connection)
    ├→ backend/middleware/auth.js (JWT verification)
    ├→ backend/routes/auth.js (signup/login)
    ├→ backend/routes/products.js (product CRUD)
    └→ backend/routes/transactions.js (purchase history)
```

---

## Environment Configuration

### Backend `.env` File
Required environment variables in `backend/.env`:
```
DB_USER=oracle_username
DB_PASSWORD=oracle_password
DB_CONNECTION_STRING=oracle_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## Build & Deployment Artifacts

### Generated During Build
- `backend/node_modules/` - Installed backend dependencies
- `node_modules/` - Installed frontend dependencies
- Frontend build output (created by `npm run build`)

### Never Committed
- `node_modules/` directories
- `.env` file (contains secrets)
- Temporary build artifacts

---

## Recent Changes & Updates (Current Sprint)

### Frontend Changes
- **src/api.js** - NEW: Added centralized API client for backend communication
  - `apiFetch()` function handles GET, POST, PUT, DELETE requests
  - Supports JWT token in Authorization header
  - Centralized error handling

- **src/components/LoginPage.js** - Updated to use backend API
  - Now integrates with `/api/auth/login` and `/api/auth/signup` endpoints
  - Implements loading states and error handling
  - Uses JWT token for authentication instead of localStorage

### Backend Enhancements

#### New Route Files
- **backend/routes/cart.js** - NEW: Shopping cart management
  - GET cart items for a user
  - POST add items to cart
  - PUT update quantity/options
  - DELETE remove items

- **backend/routes/categories.js** - NEW: Product category management
  - GET all categories
  - POST create category
  - PUT update category
  - DELETE remove category

- **backend/routes/orders.js** - NEW: Order tracking system
  - GET all orders with user and product details
  - POST create new order
  - PUT update order status
  - DELETE remove order

- **backend/routes/reviews.js** - NEW: Product review system
  - GET reviews for a product
  - POST add review with rating
  - PUT update review
  - DELETE remove review

#### Updated Route Files
- **backend/routes/auth.js** - Improvements:
  - Better variable naming in RETURNING clause
  - Streamlined connection closing
  - Updated balance endpoint to use JWT middleware

- **backend/routes/products.js** - Enhancements:
  - Added JWT authentication middleware to POST route
  - Seller ID extracted from token (req.user.userId)
  - Improved error handling

- **backend/routes/transactions.js** - Major updates:
  - Added JWT middleware to POST routes
  - User ID from token instead of request body
  - NEW GET endpoint to retrieve all transactions
  - Improved validation and rollback handling

#### Updated Configuration Files
- **backend/server.js** - Updated route registrations
  - Added `/api/cart`, `/api/categories`, `/api/orders`, `/api/reviews` routes

- **backend/middleware/auth.js** - JWT verification middleware
  - Extracts token from Authorization header
  - Verifies token validity with JWT_SECRET
  - Attaches decoded user info to request

- **backend/config/database.js** - Minor updates
  - Added file header comment

- **backend/.env** - Database configuration updated
  - DB_CONNECTION_STRING: Updated to IP-based connection (199.212.26.208:1521/SQLD)

### Dependencies Added (Frontend package.json)
- `bcrypt` (^6.0.0) - Password hashing
- `cors` (^2.8.5) - Cross-origin request handling
- `express` (^5.1.0) - Express.js v5 framework
- `jsonwebtoken` (^9.0.2) - JWT token handling
- `dotenv` (^17.2.3) - Environment variables
- `oracledb` (^6.10.0) - Oracle database driver

---

## Quick Reference by File Type

### JavaScript Files
- **Entry Points**: `src/index.js`, `backend/server.js`
- **Components**: `src/components/*.js`, `src/pages/*.js`
- **Config**: `src/utils/*.js`, `backend/config/*.js`
- **Routes**: `backend/routes/*.js`
- **Middleware**: `backend/middleware/*.js`

### Configuration Files
- **Package Configs**: `package.json`, `backend/package.json`
- **CSS Frameworks**: `tailwind.config.js`, `postcss.config.js`
- **Environment**: `backend/.env`

### Static Assets
- **Images**: `public/logo*.png`, `public/favicon.ico`
- **HTML**: `public/index.html`
- **Manifest**: `public/manifest.json`
- **SEO**: `public/robots.txt`

### Documentation
- `README.md` - Setup and overview
- `PROJECT_DOCUMENTATION.md` - Feature details
- `FILE_PATH_MAP.md` - This file

---

## Total File Count Summary

| Category | Count |
|----------|-------|
| Configuration Files | 7 |
| Documentation Files | 3 |
| Frontend Components & Pages | 8 |
| Backend Routes & Middleware | 9 |
| Public Assets | 6 |
| Node Package Files | 4 |
| **Total** | **37+** |

*(excluding node_modules and .git directories)*

---

## Architecture & Integration Overview

### API Architecture Pattern
```
Frontend (React)
    ↓
src/api.js (apiFetch client)
    ↓
Express Server (backend/server.js)
    ↓
Routes (backend/routes/*.js)
    ├→ Middleware (auth verification)
    └→ Oracle Database
```

### Authentication Flow
```
1. User submits credentials (LoginPage.js)
2. API client sends to /api/auth/login or /signup
3. Backend validates and returns JWT token
4. Token stored and used in Authorization header
5. Protected routes verify token with auth middleware
```

### Complete Feature Stack

| Feature | Frontend | Backend Route | Database |
|---------|----------|---------------|----------|
| Authentication | LoginPage.js | /auth | users table |
| Product Management | ShopPage.js, SellPage.js | /products | products table |
| Shopping Cart | (Component state) | /cart | cart_items table |
| Checkout/Transactions | ShopPage.js | /transactions | transactions table |
| Orders | (To be implemented) | /orders | orders table |
| Reviews | (To be implemented) | /reviews | reviews table |
| Categories | (To be implemented) | /categories | categories table |
