# ✈️ Dream Wings – Flight Booking System

**Dream Wings** is a full-stack flight booking web application designed to provide users with a simple and interactive platform to search for flights, select seats, enter passenger details, generate booking bills, and complete payments through a simulated payment gateway.

## 🌐 Live Demo

🔗 **Live Website:** [https://lnkd.in/dpUJtME6](https://integrated-flight-system.onrender.com/)

## 📂 GitHub Repository

🔗 **Repository:** https://lnkd.in/dmFZSBEg

---

## 📌 Features

* 🔐 User Login
* ✈️ Flight Search
* 🔎 Flight Details
* 💺 Seat Selection
* 👤 Passenger Information
* 🧾 Automatic Bill Generation
* 💳 Dummy Payment Gateway
* 🎫 Real-time Ticket Generation
* ✅ Booking Confirmation
* 🌍 Explore Flights
* 👥 Team Details
* 📱 Responsive and user-friendly interface

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Data Storage

* JSON

### Deployment

* Web Server / Cloud Deployment

---

## 📁 Project Structure

```text
Dream-Wings/
│
├── backend/
│   ├── server.js
│   ├── booking.json
│   ├── flights.json
│   └── package.json
│
├── frontend/
│   ├── login.html
│   ├── search.html
│   ├── seat.html
│   ├── passenger.html
│   ├── bill.html
│   ├── payment.html
│   ├── thankyou.html
│   ├── explore.html
│   ├── team.html
│   │
│   ├── css/
│   ├── js/
│   └── images/
│
└── README.md
```

> The exact folder structure may vary depending on the current version of the project.

---

## 🔄 Application Flow

```text
Login
  ↓
Search Flights
  ↓
Select Flight
  ↓
Choose Seat
  ↓
Enter Passenger Details
  ↓
Generate Bill
  ↓
Make Payment
  ↓
Generate Ticket
  ↓
Booking Confirmation
```

---

## 💺 Seat Booking

Users can select their preferred seats while booking a flight.

The current version provides seat selection functionality. Future versions can introduce **real-time seat locking and availability synchronization** to prevent multiple users from selecting the same seat.

---

## 🧾 Booking Data

Booking information is maintained in JSON format and includes details such as:

```text
Booking ID
Username
Flight ID
Origin
Destination
Travel Date
Number of Passengers
Seat Number
Price
Payment Status
Flight Timing
```

---

## ✈️ Flight Data

Flight information is stored in `flights.json`, including:

* Flight Name
* Flight ID
* Departure & Arrival Timings
* Ticket Price
* Flight Image

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### 2. Navigate to the Project

```bash
cd Dream-Wings
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
node server.js
```

### 5. Open the Application

Open the local server URL displayed in your terminal.

---

## 🚀 Future Enhancements

* 🔒 Real-time seat locking
* 🗄️ MongoDB/MySQL database integration
* 👤 User registration and authentication
* 💳 Real payment gateway integration
* 📧 Email ticket confirmation
* 📱 Improved mobile responsiveness
* 🔔 Booking notifications
* 🧑‍💼 Admin dashboard
* 📊 Booking management and analytics

---

## 🎯 Project Objective

The main objective of **Dream Wings** is to demonstrate how a flight booking workflow can be implemented as a web application while applying concepts of **frontend development, backend development, API handling, data management, and deployment**.

---

## 👨‍💻 Team Project

Dream Wings was developed as a **team project**, where team members collaborated on different aspects of the application, including frontend development, backend functionality, UI design, testing, and deployment.

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐!

**Dream Wings – Making Flight Booking Simple, Interactive & Accessible.** ✈️
