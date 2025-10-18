# chemical_webapp
Compound Management System

A modern web app to manage chemical compounds with user authentication, interactive gallery, detailed views, and edit functionality. Designed to be responsive, animated, and visually appealing.

Features

Authentication: Signup, Login, Forgot & Reset Password

Compound Gallery: Browse compounds with animated cards and hover effects

Compound Details: View image, name, description with attractive styling

Edit Compound: Update compound info in real-time with form validation

Responsive Design: Works seamlessly on desktop, tablet, and mobile

Tech Stack

Frontend: Angular, Angular Material, CSS3

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT & Email Verification

Setup

Frontend:
cd frontend
npm install
ng serve --open


Backend:
cd backend
npm install
# set .env with PORT, MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS
npm run dev

Folder Structure

Copy code
frontend/  # Angular code
backend/   # Node.js + Express API
