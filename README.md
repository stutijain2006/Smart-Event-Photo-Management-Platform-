# 📸 Smart Event Photo Management Platform

A **full-stack, AI-powered, real-time event photo management platform** designed to simplify how photos are uploaded, discovered, and shared during large events such as college fests, conferences, hackathons, and competitions.

The platform combines **secure authentication**, **AI-based image understanding**, **real-time notifications**, and **batch photo operations** into a single, scalable system.

---

## 🌟 What This Application Does

This platform allows:
- Photographers to upload event photos effortlessly
- Users to automatically discover photos they are part of
- Admins to manage users, events, and content
- Everyone to receive **real-time updates** when new photos are uploaded

Manual photo tagging and scattered sharing are completely eliminated.

---

## 🚀 Core Features

### 🔐 Authentication & Authorization
- Omniport OAuth-based login
- Secure session-based authentication
- Role-based permissions across the platform

---

### 👥 Role System
- **Admin**
  - Manage users and roles
  - Delete any photo
  - Moderate events and albums
- **Photographer**
  - Upload photos
  - Tag people
- **Event Manager**
  - Manage event albums
- **User**
  - View, like, and download photos
  - Receive notifications when tagged

---

### 📷 Photo Management
- Upload single or multiple photos
- Automatic generation of:
  - Original image
  - Compressed image
  - Watermarked image
- Track photo metrics:
  - Likes
  - Views
  - Downloads

---

### 🧠 AI-Based Auto Tagging
- Uses **ResNet50 (ImageNet pre-trained model)**
- Automatically generates descriptive tags such as:
  - `people`, `crowd`, `stage`, `car`, `sunset`, `nature`
- Tags are stored per photo
- Enables powerful search and tag-based filtering

No manual tagging required.

---

### 🖼️ Smart Photo Layouts
Users can switch between:
- Grid (3 images)
- Grid (4 images)
- Masonry layout
- Timeline view (grouped by upload date)

---

### 🔎 Search & Tag Filtering
- Search photos by:
  - Photographer name
  - Photo ID
  - Auto-generated AI tags
- Filter photos using a dropdown of available tags

---

### 📦 Batch Operations
- Multi-select photos
- Perform actions on multiple photos at once:
  - Like
  - Download (original / compressed / watermarked)
  - Delete (admin only)
  - Remove from album

---

### 🔔 Real-Time Notifications
- Implemented using **Django Channels + WebSockets**
- Notifications triggered for:
  - New photo uploads in events
  - User tagging
- Delivered instantly without refreshing the page

---

## 🏗️ Tech Stack

### Backend
- Django 5
- Django REST Framework
- Django Channels
- Redis
- TensorFlow + Keras
- Pillow

### Frontend
- React (TypeScript)
- Redux Toolkit
- Tailwind CSS
- Axios
- WebSockets

---

## ⚙️ Backend Setup

### Create a Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate      # Linux / macOS
.venv\Scripts\activate         # Windows
```

### 2️⃣ Install Backend Dependencies
⚠️ There is no requirements.txt, install dependencies manually.
```bash
pip install django
pip install djangorestframework
pip install django-channels
pip install channels-redis
pip install pillow
pip install tensorflow
pip install keras
pip install requests
```

### 3️⃣ Redis Setup (MANDATORY)
Redis is required for:
* WebSocket communication
* Real-time notifications
* Django Channels layer

Install Redis
```bash
Windows
Download from:
https://github.com/microsoftarchive/redis/releases
```
```bash
Linux
sudo apt install redis-server
```

### Start Redis Server
```bash
redis-server
```

### Ensure Redis is running on:
```bash
localhost:6379
```

### 4️⃣ Apply Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5️⃣ Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### Access Django Admin:
http://127.0.0.1:8000/admin

### 6️⃣ Create Roles (MANDATORY)
⚠️ Without roles, permission checks and isAdmin logic will not work.
In Django Admin, create the following roles:
* ADMIN
* PHOTOGRAPHER
* USER
* EVENT_MANAGER

### 7️⃣ Assign Admin Role to Superuser
Open Django Admin
Go to UserRole / Role Assignment
Assign:
* User → Superuser
* Role → ADMIN
❗ Even superusers must be assigned ADMIN role manually.

### 8️⃣ Start Backend Server
```
python manage.py runserver
```

### Backend runs at:
http://127.0.0.1:8000

### 9️⃣ Frontend Setup
Navigate to frontend directory:
```
cd frontend
npm install
```

Libraries used:
* React
* React Router
* Redux Toolkit
* Axios
* Tailwind CSS

### 🔟 Start Frontend Server
```
npm start
```
Frontend runs at:
http://localhost:3000

## 🔐 Omniport Authentication Flow
* User clicks Login with Omniport
* Redirected to Omniport OAuth
* Omniport redirects back with authorization code
* Backend exchanges code for tokens
* User data fetched from Omniport
* User is created/logged in
* Session is established securely

## 🧠 AI Auto-Tagging Workflow
* Triggered automatically on photo upload
* Uses ResNet50 (ImageNet pre-trained model)
* Detects objects and scenes
* Converts predictions into readable tags
* Tags stored in database

Used for:
* Search
* Tag filtering
* Photo discovery

✅ No manual model training required.

## 🔔 Notifications Flow
* Photo uploaded or user tagged
* Notification stored in database
* Redis + Channels broadcasts event
* WebSocket pushes notification instantly to frontend

## 👤 User Flow Summary
### Regular User
* Login via Omniport
* Browse events and albums
* Get notified when tagged
* Like and download photos
* Filter photos using tags

### Photographer
* Upload photos
* Auto-tagging runs automatically
* Tag people
* Photos appear live to users

### Admin
* Manage users and roles
* Delete photos
* Moderate content

## 🛡️ Security Highlights
* Role-based permissions
* Secure OAuth handling
* Authenticated WebSocketsAPI-level access control
