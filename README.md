# SAN Fastfood — React App

## 🚀 Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 3. Build for production
```bash
npm run build
```
This creates a `dist/` folder — upload everything inside `dist/` to your hosting.

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Top navigation bar
│   ├── Hero.jsx            # Hero section + offer banner
│   ├── MenuSection.jsx     # Categories + search + menu grid
│   ├── MenuItem.jsx        # Individual food card
│   ├── CartDrawer.jsx      # Cart with coupon + WhatsApp order
│   ├── ProfileDrawer.jsx   # User profile + order history
│   ├── AdminDrawer.jsx     # Admin: coupons + offer banner
│   ├── DrawerManager.jsx   # Handles all drawers
│   ├── FloatingCart.jsx    # Floating cart button
│   ├── LoginModal.jsx      # Simple name+phone login
│   ├── Toast.jsx           # Toast notifications
│   └── Footer.jsx          # Info cards + footer
├── context/
│   └── AppContext.jsx      # Global state (cart, user, etc.)
├── data/
│   └── menuData.js         # All menu items & categories
├── firebase.js             # Firebase config
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Global styles
```

---

## 🔑 Admin Access
Login with phone number: **7001728030**
You'll see the "⚙️ Open Admin Panel" button in your profile.

## 💰 Login Method
Simple name + phone — NO OTP, completely FREE.

## 🖼️ Images
Place your images in `public/images/` folder:
- public/images/rice/
- public/images/chicken/
- public/images/momo/
- public/images/snacks/
- public/images/breakfast/
- public/images/roll/
- public/images/drinks/
- public/images/pizza/

## 🌐 Deploy to Hostinger / cPanel
1. Run `npm run build`
2. Upload everything inside `dist/` folder to your `public_html/`
3. Done! ✅
