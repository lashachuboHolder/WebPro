# Fundstart - Fundraising Platform

## How to Run

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
Runs on http://localhost:5000

### 2. Start the Frontend (open a new terminal)

**Mac / Linux:**
```bash
cd frontend
npm install
npm start
```

**Windows:**
```bash
cd frontend
npm install
npm run start:win
```

Runs on http://localhost:3000

---

## Demo Accounts

| Role        | Email                   | Password    |
|-------------|-------------------------|-------------|
| Admin       | admin@fundstart.com     | admin123    |
| Influencer  | olivia@fundstart.com    | olivia123   |
| Influencer  | marcus@fundstart.com    | marcus123   |
| Donor       | sarah@example.com       | sarah123    |
| Donor       | james@example.com       | james123    |

---

## Project Structure

```
fundstart/
├── backend/
│   ├── server.js           # Express server entry point
│   ├── package.json
│   ├── data/
│   │   └── seed.js         # In-memory data (users, campaigns, donations)
│   ├── middleware/
│   │   └── auth.js         # Token auth middleware
│   └── routes/
│       ├── auth.js         # Login, register, logout
│       ├── campaigns.js    # CRUD campaigns
│       ├── donations.js    # Create/view donations
│       └── admin.js        # Admin stats and controls
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js        # Entry point
        ├── index.css       # All styles
        ├── App.js          # Routing
        ├── AuthContext.js  # Auth state
        ├── api.js          # Axios setup
        ├── Navbar.js
        ├── CampaignCard.js
        ├── Home.js
        ├── Auth.js         # Login + Register
        ├── Campaigns.js
        ├── CampaignDetail.js
        ├── Dashboard.js
        ├── MyDonations.js
        └── AdminPanel.js
```
