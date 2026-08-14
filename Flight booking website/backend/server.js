const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Path to data/bookings.json
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Helper: load bookings with error handling
function loadBookings() {
    try {
        if (!fs.existsSync(BOOKINGS_FILE)) {
            console.log("Bookings file not found. Returning empty array.");
            return [];
        }
        const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
        if (!data || data.trim() === "") {
            return [];
        }
        return JSON.parse(data);
    } catch (err) {
        console.error("Critical error reading bookings:", err);
        return [];
    }
}

// Helper: save bookings with directory check
function saveBookings(bookings) {
    try {
        // Ensure the directory exists
        const dir = path.dirname(BOOKINGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        return true;
    } catch (err) {
        console.error("Critical error saving bookings:", err);
        return false;
    }
}

// Example flights
const flights = [
  { id: 1, airline: "IndiGo", from: "Delhi", to: "Mumbai", date: "2025-11-09", price: 4520 },
  { id: 2, airline: "Air India", from: "Delhi", to: "Bangalore", date: "2025-11-10", price: 4780 },
  { id: 3, airline: "AirAsia", from: "Mumbai", to: "Chennai", date: "2025-11-11", price: 4170 },
  { id: 4, airline: "Vistara", from: "Bangalore", to: "Delhi", date: "2025-11-12", price: 5090 },
  { id: 5, airline: "SpiceJet", from: "Hyderabad", to: "Kolkata", date: "2025-11-13", price: 4990 },
  { id: 6, airline: "Go First", from: "Chennai", to: "Ahmedabad", date: "2025-11-14", price: 3900 },
  { id: 7, airline: "IndiGo", from: "Pune", to: "Goa", date: "2025-11-15", price: 3225 },
  { id: 8, airline: "Air India", from: "Delhi", to: "Kolkata", date: "2025-11-16", price: 4700 },
  { id: 9, airline: "Emirates", from: "Delhi", to: "Dubai", date: "2025-11-17", price: 15300 },
  { id: 10, airline: "British Airways", from: "Mumbai", to: "London", date: "2025-11-18", price: 40200 },
  { id: 11, airline: "Singapore Airlines", from: "Chennai", to: "Singapore", date: "2025-11-19", price: 22750 },
  { id: 12, airline: "Qatar Airways", from: "Hyderabad", to: "Doha", date: "2025-11-20", price: 16500 },
  { id: 13, airline: "Air India", from: "Delhi", to: "New York", date: "2025-11-21", price: 79999 },
  { id: 14, airline: "American Airlines", from: "New York", to: "Los Angeles", date: "2025-11-10", price: 35500 },
  { id: 15, airline: "United Airlines", from: "Chicago", to: "San Francisco", date: "2025-11-13", price: 37000 },
  { id: 16, airline: "Avianca", from: "Bogota", to: "Lima", date: "2025-11-13", price: 13800 },
  { id: 17, airline: "Copa Airlines", from: "Panama City", to: "Buenos Aires", date: "2025-11-20", price: 23100 },
  { id: 18, airline: "Delta", from: "Atlanta", to: "Toronto", date: "2025-11-21", price: 26000 },
  { id: 19, airline: "Lufthansa", from: "Frankfurt", to: "Munich", date: "2025-11-12", price: 10900 },
  { id: 20, airline: "Air France", from: "Paris", to: "London", date: "2025-11-15", price: 10400 },
  { id: 21, airline: "British Airways", from: "London", to: "Berlin", date: "2025-11-16", price: 11200 },
  { id: 22, airline: "KLM", from: "Amsterdam", to: "Zurich", date: "2025-11-20", price: 11500 },
  { id: 23, airline: "ANA", from: "Tokyo", to: "Osaka", date: "2025-11-11", price: 14900 },
  { id: 24, airline: "Thai Airways", from: "Bangkok", to: "Hong Kong", date: "2025-11-16", price: 18050 },
  { id: 25, airline: "Emirates", from: "Dubai", to: "Singapore", date: "2025-11-23", price: 24200 },
  { id: 26, airline: "Ethiopian Airlines", from: "Addis Ababa", to: "Nairobi", date: "2025-11-10", price: 18900 },
  { id: 27, airline: "EgyptAir", from: "Cairo", to: "Johannesburg", date: "2025-11-13", price: 25500 },
  { id: 28, airline: "RwandAir", from: "Kigali", to: "Lagos", date: "2025-11-20", price: 22200 },
  { id: 29, airline: "Qantas", from: "Sydney", to: "Melbourne", date: "2025-11-19", price: 16200 },
  { id: 30, airline: "Air New Zealand", from: "Auckland", to: "Sydney", date: "2025-11-22", price: 28800 },
  { id: 31, airline: "Qantas", from: "Sydney", to: "Los Angeles", date: "2025-11-25", price: 48400 },
  { id: 32, airline: "Emirates", from: "Dubai", to: "New York", date: "2025-11-28", price: 91300 },
  { id: 33, airline: "Turkish Airlines", from: "Istanbul", to: "San Francisco", date: "2025-11-29", price: 73400 },
  { id: 34, airline: "Qatar Airways", from: "Doha", to: "Sydney", date: "2025-12-01", price: 83400 },
  { id: 35, airline: "Turkish Airlines", from: "Istanbul", to: "Paris", date: "2025-11-12", price: 21000 },
  { id: 36, airline: "Swiss", from: "Zurich", to: "Rome", date: "2025-11-18", price: 14500 },
  { id: 37, airline: "Kenya Airways", from: "Nairobi", to: "Dubai", date: "2025-11-15", price: 23400 }
];

// --- API ---

app.post('/api/search', (req, res) => {
    const { from, to, date } = req.body;
    if (!from || !to || !date) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const results = flights.filter(f => f.from === from && f.to === to && f.date === date);
    res.json(results);
});

app.post('/api/book', (req, res) => {
    console.log("Received booking request:", req.body); // Diagnostic: See if data hits the server
    
    const { flightId, name, email, seats, passengers } = req.body;
    
    if (!flightId || !name || !email || !seats || !Array.isArray(seats) || seats.length === 0) {
        console.log("Validation failed: Missing fields");
        return res.status(400).json({ error: 'Missing booking fields' });
    }
    
    const flight = flights.find(f => f.id === flightId);
    if (!flight) {
        console.log("Validation failed: Flight not found");
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    let bookings = loadBookings();
    let booking = {
        id: Date.now(),
        flightId,
        name,
        email,
        flight,
        seats,
        passengers
    };
    
    bookings.push(booking);
    console.log("Attempting to save booking:", booking); // Diagnostic
    
    if (saveBookings(bookings)) {
        console.log("Save successful!"); // Diagnostic
        res.json({ success: true, booking });
    } else {
        console.log("Save failed in saveBookings function"); // Diagnostic
        res.status(500).json({ error: 'Failed to save booking to disk' });
    }
});

app.get('/api/bookings', (req, res) => {
    const bookings = loadBookings();
    console.log("Fetching bookings:", bookings); // Diagnostic
    res.json(bookings);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`DreamWings server running at http://localhost:${PORT}`);
    console.log(`Data will be saved at: ${BOOKINGS_FILE}`);
});

