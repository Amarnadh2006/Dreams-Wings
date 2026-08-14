// ==== CONFIGURATION ====
const seatClassPrice = { first: 15000, business: 9000, economy: 3200 };
let promoDiscount = 1;
let occupiedSeats = [], selectedSeats = [], selectedFlight = null, passengerInfo = null, selectedTickets = 0;
let seatRows = 9, seatCols = 8, seatLabels = ["A","B","C","D","E","F","G","H"];

// ==== NOTIFICATION HELPERS ====
function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}
function showNotification(title, body = "", icon = "") {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon });
  } else {
    alert(title + (body ? "\n" + body : ""));
  }
}

// ==== CURTAIN INTRO ====
window.onload = function() {
  var vid = document.getElementById('intro-video');
  var introDiv = document.getElementById('video-intro');
  function showLoginAnimated() {
    setTimeout(() => {
      startAuthFlow();
      let modal = document.getElementById('auth-modal-content');
      if (modal) {
        modal.classList.remove('modal-in');
        void modal.offsetWidth;
        modal.classList.add('modal-in');
      }
    }, 0);
  }
  function fadeAndRevealApp() {
    introDiv.style.opacity = '0';
    setTimeout(() => {
      introDiv.style.display = 'none';
      showLoginAnimated();
    },700);
  }
  if (vid) {
    vid.onended = fadeAndRevealApp;
    vid.oncanplay = () => {
      setTimeout(() => {
        if (introDiv && introDiv.style.display !== 'none') fadeAndRevealApp();
      }, Math.max(vid.duration - 0.23, 3.5) * 1000);
    };
  } else {
    setTimeout(fadeAndRevealApp, 3800);
  }
};

// ==== DARK MODE ====
document.getElementById('toggle-dark').onclick = function() {
  document.body.classList.toggle('dark');
};

// ==== STEP NAVIGATION ====
const steps = [
  'search-section', 'seat-section', 'passenger-section',
  'bill-section', 'payment-section', 'thank-section', 'explore-section',
  'team-section'
];
function showStep(idx) {
  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i === 4) el.classList.toggle("vibrant-bg", idx === 4);
    else el.classList.remove("vibrant-bg");
    el.className = "booking-step " + (i === idx ? "shown" : "hidden");
    if(document.getElementsByClassName('step')[i])
      document.getElementsByClassName('step')[i].classList.toggle('active', i === idx);
  });
  window.scrollTo({top:0, behavior:"smooth"});
  // Special: Initialize flight map only when Explore section opens
  if (steps[idx] === "explore-section") setTimeout(initFlightMap, 150);
}

// ==== EXPLORE SECTION (Interactive Flight Map) ====
let flightMap = null, routeLayer = null, airplaneMarker = null, selectedPoints = [];
let mapCities = [
  ['Delhi', 28.6139, 77.2090],
  ['Mumbai', 19.0760, 72.8777],
  ['Bangalore', 12.9716, 77.5946],
  ['London', 51.5074, -0.1278],
  ['Dubai', 25.2048, 55.2708],
  ['Frankfurt', 50.1109, 8.6821],
  ['Singapore', 1.3521, 103.8198]
];

function initFlightMap() {
  let mapDiv = document.getElementById('map');
  if (!mapDiv) return;
  mapDiv.innerHTML = "";
  if (flightMap) { try { flightMap.remove(); } catch(_) {} flightMap = null; }
  routeLayer = null; airplaneMarker = null; selectedPoints = [];
  flightMap = L.map('map', {scrollWheelZoom: false, zoomControl: true}).setView([24.5, 84.0], 4.2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: ''}).addTo(flightMap);

  mapCities.forEach(([city,lat,lng])=>{
    let m = L.marker([lat,lng]).addTo(flightMap).bindTooltip(city, {permanent:false, direction:'top'});
    m.on('click', function() {
      if (selectedPoints.length===2) {
        selectedPoints=[]; 
        if (routeLayer) {routeLayer.remove(); routeLayer=null;}
        if (airplaneMarker) {airplaneMarker.remove(); airplaneMarker=null;}
      }
      selectedPoints.push([lat,lng]);
      if (selectedPoints.length===2) {
        if (routeLayer) {routeLayer.remove(); routeLayer=null;}
        if (airplaneMarker) {airplaneMarker.remove(); airplaneMarker=null;}
        routeLayer = L.polyline(selectedPoints, {
          color:'#2b8af6', weight:4, dashArray:'8,8', opacity:0.88
        }).addTo(flightMap);
        let p1=selectedPoints[0], p2=selectedPoints[1];
        flightMap.fitBounds([p1,p2],{padding:[60,60]});
        let mid = [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2];
        airplaneMarker = L.marker(mid, {
          icon: L.divIcon({
            html: '✈️',
            className: '',
            iconSize: [32,32]
          })
        }).addTo(flightMap);
      }
    });
  });
}

// ==== NAV BUTTONS ====
document.getElementById('nav-flights').onclick = ()=>showStep(0);
document.getElementById('nav-bookings').onclick = ()=>showStep(6); // Explore step

// ==== LOGIN / REGISTER FLOW ====
function startAuthFlow() {
  let user = JSON.parse(localStorage.getItem("dreamUser") || "{}");
  if (!user.username) {
    showRegisterModal();
  } else {
    showLoginModal();
  }
}
function showLoginModal() {
  document.getElementById('auth-modal').style.display = "flex";
  document.getElementById('auth-modal-content').innerHTML =
    `<h2>Login</h2>
    <input type="text" id="login-username" placeholder="Username" autofocus>
    <input type="password" id="login-password" placeholder="Password">
    <button onclick="loginUser()" class="main-btn">Login</button>
    <div style="margin-top:14px;">
      <span>First time?</span>
      <button onclick="showRegisterModal()" class="main-btn" style="margin-top:6px;">Register</button>
    </div>`;
}
function showRegisterModal() {
  document.getElementById('auth-modal').style.display = "flex";
  document.getElementById('auth-modal-content').innerHTML =
    `<h2>Register</h2>
    <input type="text" id="reg-username" placeholder="Username" autofocus>
    <input type="email" id="reg-email" placeholder="Email">
    <input type="password" id="reg-password" placeholder="Password">
    <button onclick="registerUser()" class="main-btn">Register</button>`;
}
window.loginUser = function() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const stored = JSON.parse(localStorage.getItem("dreamUser") || "{}");
  if (username === stored.username && password === stored.password) {
    document.getElementById('auth-modal').style.display = "none";
    showProfile();
    document.getElementById('admin-btn').style.display = (username === "admin") ? "inline-block" : "none";
    requestNotificationPermission();
  } else {
    alert("Incorrect username or password!");
  }
};
window.registerUser = function() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  if (!username || !email || !password) { alert("All fields required!"); return; }
  const user = { username, email, password, avatar: null };
  localStorage.setItem("dreamUser", JSON.stringify(user));
  showLoginModal();
  requestNotificationPermission();
};

// ==== AVATAR UPLOAD ====
const avatarInput = document.getElementById('avatar-input');
if (avatarInput) {
  avatarInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      let user = JSON.parse(localStorage.getItem("dreamUser")||"{}");
      user.avatar = ev.target.result;
      localStorage.setItem("dreamUser", JSON.stringify(user));
      showProfile();
    };
    reader.readAsDataURL(file);
  };
}

// ==== PROFILE & HISTORY ====

function showProfile() {

    document.getElementById('profile-section').style.display = "block";

    document.getElementById('profile-section').className =
        "booking-step shown";

    document.getElementById('main-content').style.display = "none";


    // Get current user

    const user =
        JSON.parse(
            localStorage.getItem("dreamUser") || "{}"
        );


    // Get avatar

    let avatarHtml = user.avatar
        ? `<img src="${user.avatar}" class="avatar-img" alt="avatar"><br>`
        : '';


    // Get all bookings

    const bookings =
        JSON.parse(
            localStorage.getItem('savedBookings') || '[]'
        );


    // Get only current user's bookings

    const userBookings =
        bookings.filter(
            b => b.username === user.username
        );


    // ==========================================
    // PROFILE DETAILS
    // ==========================================

    document.getElementById('profile-details').innerHTML =

        avatarHtml +

        `<strong>Username:</strong>
        ${user.username || "N/A"}<br>

        <strong>Email:</strong>
        ${user.email || "N/A"}<br>`;


    // ==========================================
    // BOOKING HISTORY
    // ==========================================

    if (userBookings.length === 0) {

        document.getElementById('history-section').innerHTML = `

            <h3>Booking History</h3>

            <div class="no-bookings">

                ✈️ No saved bookings

            </div>

        `;

        return;
    }


    // ==========================================
    // CREATE BOOKING CARDS
    // ==========================================

    let historyHtml = `

        <h3 class="history-title">
            Booking History
        </h3>

        <div class="booking-history-list">
    `;


    userBookings.forEach(
        (b, i) => {

            // Calculate total price

            let totalPrice = 0;

            if (b.seats && Array.isArray(b.seats)) {

                totalPrice =
                    b.seats
                        .map(
                            seat =>
                                seatClassPrice[
                                    getSeatClass(
                                        parseInt(seat)
                                    )
                                ]
                        )
                        .reduce(
                            (a, b) => a + b,
                            0
                        );

            }


            historyHtml += `

                <div class="booking-history-card">


                    <!-- BOOKING HEADER -->

                    <div class="booking-history-header">

                        <h3>
                            ✈️ ${b.airline || "DreamWings"}
                        </h3>

                        <span class="booking-confirmed">

                            ✓ Confirmed

                        </span>

                    </div>


                    <!-- FLIGHT ROUTE -->

                    <div class="booking-flight">


                        <div class="booking-airport">

                            <strong>
                                ${b.from || "N/A"}
                            </strong>

                            <small>
                                Departure
                            </small>

                        </div>


                        <div class="booking-arrow">

                            ✈

                        </div>


                        <div class="booking-airport">

                            <strong>
                                ${b.to || "N/A"}
                            </strong>

                            <small>
                                Arrival
                            </small>

                        </div>


                    </div>


                    <!-- BOOKING DETAILS -->

                    <div class="booking-info">


                        <div>

                            <span>
                                📅 Date
                            </span>

                            <strong>
                                ${b.date || "N/A"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                👤 Passenger
                            </span>

                            <strong>
                                ${b.passengerName ||
                                b.username ||
                                user.username}
                            </strong>

                        </div>


                        <div>

                            <span>
                                💺 Seat
                            </span>

                            <strong>
                                ${b.seats
                                    ? b.seats.join(', ')
                                    : "N/A"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                💳 Amount
                            </span>

                            <strong>
                                ₹${totalPrice}
                            </strong>

                        </div>


                    </div>


                    <!-- BUTTONS -->

                    <div class="booking-action-buttons">


                        <!-- DOWNLOAD TICKET -->

                        <button
                            class="download-ticket-btn"
                            onclick="downloadTicket(${i})">

                            📄 Download Ticket

                        </button>


                        <!-- REBOOK -->

                        <button
                            class="rebook-btn"
                            onclick="rebook(${i})">

                            🔄 Rebook

                        </button>


                    </div>


                </div>

            `;

        }
    );


    historyHtml += `</div>`;


    document.getElementById(
        'history-section'
    ).innerHTML = historyHtml;
}


// ==========================================
// DOWNLOAD TICKET
// ==========================================

window.downloadTicket = function(index) {

    const bookings =
        JSON.parse(localStorage.getItem("savedBookings") || "[]");

    const user =
        JSON.parse(localStorage.getItem("dreamUser") || "{}");

    const userBookings =
        bookings.filter(b => b.username === user.username);

    const booking = userBookings[index];

    if (!booking) {
        alert("Booking details not found.");
        return;
    }


    // ==============================
    // PASSENGER DETAILS
    // ==============================

    let passengers = [];

    if (Array.isArray(booking.passengers)) {
        passengers = booking.passengers;
    }

    // If passenger data is stored under passengerInfo
    else if (booking.passengerInfo &&
             Array.isArray(booking.passengerInfo.passengers)) {

        passengers = booking.passengerInfo.passengers;
    }


    // ==============================
    // SEATS
    // ==============================

    const seats =
        Array.isArray(booking.seats)
            ? booking.seats
            : [];


    // ==============================
    // FLIGHT DETAILS
    // ==============================

    const airline =
        booking.airline || "DreamWings";

    const from =
        booking.from || "-";

    const to =
        booking.to || "-";

    const date =
        booking.date || "-";

    const time =
        booking.time ||
        booking.departureTime ||
        "Scheduled";

    const flightNumber =
        booking.flightNumber ||
        booking.flightNo ||
        "DW-" +
        Math.floor(100 + Math.random() * 900);


    // ==============================
    // BOOKING REFERENCE
    // ==============================

    const reference =
        booking.bookingReference ||
        "DW-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();


    // ==============================
    // CREATE PDF
    // ==============================

    if (!(window.jspdf && window.jspdf.jsPDF)) {

        alert("jsPDF not loaded.");

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF({
            format: "a4",
            orientation: "portrait"
        });


    // ==============================
    // COLORS
    // ==============================

    const blue = [22, 119, 255];

    const dark = [35, 40, 50];

    const gray = [110, 110, 110];

    const light = [245, 248, 252];


    // ==============================
    // HEADER
    // ==============================

    doc.setFillColor(
        blue[0],
        blue[1],
        blue[2]
    );

    doc.rect(
        0,
        0,
        210,
        38,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(22);

    doc.text(
        "DreamWings",
        15,
        17
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);

    doc.text(
        "Electronic Flight Ticket",
        15,
        25
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.text(
        "BOOKING CONFIRMED",
        150,
        18
    );

    doc.text(
        "✓ Payment Successful",
        150,
        25
    );


    // ==============================
    // BOOKING REFERENCE
    // ==============================

    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "Booking Reference",
        15,
        50
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(11);

    doc.text(
        reference,
        15,
        57
    );


    doc.text(
        "Passengers: " +
        (
            passengers.length ||
            seats.length ||
            1
        ),
        145,
        57
    );


    // ==============================
    // FLIGHT ROUTE
    // ==============================

    doc.setFillColor(
        light[0],
        light[1],
        light[2]
    );

    doc.roundedRect(
        15,
        68,
        180,
        45,
        4,
        4,
        "F"
    );


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(20);

    doc.text(
        from,
        30,
        88
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        gray[0],
        gray[1],
        gray[2]
    );

    doc.text(
        "DEPARTURE",
        30,
        97
    );


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );

    doc.setFontSize(16);

    doc.text(
        "->",
        100,
        90
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(20);

    doc.text(
        to,
        155,
        88
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        gray[0],
        gray[1],
        gray[2]
    );

    doc.text(
        "ARRIVAL",
        155,
        97
    );


    // ==============================
    // FLIGHT DETAILS
    // ==============================

    let y = 125;


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);

    doc.text(
        "Flight Details",
        15,
        y
    );


    y += 8;


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);

    doc.text(
        "Airline: " + airline,
        15,
        y
    );

    doc.text(
        "Flight No: " + flightNumber,
        110,
        y
    );


    y += 7;


    doc.text(
        "Date: " + date,
        15,
        y
    );

    doc.text(
        "Departure: " + time,
        110,
        y
    );


    y += 15;


    // ==============================
    // PASSENGER TABLE
    // ==============================

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);

    doc.text(
        "Passenger & Seat Details",
        15,
        y
    );


    y += 7;


    // Table header

    doc.setFillColor(
        235,
        240,
        247
    );

    doc.rect(
        15,
        y,
        180,
        9,
        "F"
    );


    doc.setFontSize(8);

    doc.setTextColor(
        70,
        70,
        70
    );

    doc.text("#", 18, y + 6);

    doc.text(
        "Passenger",
        30,
        y + 6
    );

    doc.text(
        "Age",
        95,
        y + 6
    );

    doc.text(
        "Seat",
        115,
        y + 6
    );

    doc.text(
        "Class",
        140,
        y + 6
    );

    doc.text(
        "Fare",
        170,
        y + 6
    );


    y += 9;


    // ==============================
    // PASSENGERS
    // ==============================

    let totalFare = 0;


    // If there are passengers

    if (passengers.length > 0) {

        passengers.forEach(
            (p, i) => {

                const seat =
                    seats[i] || "-";


                const seatNumber =
                    parseInt(seat);


                let seatClass =
                    "Economy";


                if (!isNaN(seatNumber)) {

                    seatClass =
                        getSeatClass(
                            seatNumber
                        );

                }


                const fare =
                    Number(
                        seatClassPrice[seatClass] || 0
                    );


                totalFare += fare;


                // Page check

                if (y > 260) {

                    doc.addPage();

                    y = 20;

                }


                doc.setTextColor(
                    dark[0],
                    dark[1],
                    dark[2]
                );

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(8);


                doc.text(
                    String(i + 1),
                    18,
                    y + 6
                );


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    p.name ||
                    "Passenger " +
                    (i + 1),
                    30,
                    y + 6
                );


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    p.age || "-",
                    95,
                    y + 6
                );


                doc.text(
                    seat,
                    115,
                    y + 6
                );


                doc.text(
                    seatClass,
                    140,
                    y + 6
                );


                doc.text(
                    "₹" + fare,
                    170,
                    y + 6
                );


                y += 12;


                // Additional passenger details

                if (
                    p.email ||
                    p.phone ||
                    p.gender ||
                    p.country ||
                    p.passport
                ) {

                    doc.setFontSize(7);

                    doc.setTextColor(
                        gray[0],
                        gray[1],
                        gray[2]
                    );


                    let details = "";


                    if (p.gender) {

                        details +=
                            "Gender: " +
                            p.gender;

                    }


                    if (p.email) {

                        details +=
                            " | Email: " +
                            p.email;

                    }


                    if (p.phone) {

                        details +=
                            " | Phone: " +
                            p.phone;

                    }


                    if (p.country) {

                        details +=
                            " | Country: " +
                            p.country;

                    }


                    if (p.passport) {

                        details +=
                            " | Passport: " +
                            p.passport;

                    }


                    // Keep text inside PDF width

                    const splitDetails =
                        doc.splitTextToSize(
                            details,
                            160
                        );


                    doc.text(
                        splitDetails,
                        30,
                        y
                    );


                    y +=
                        splitDetails.length * 4;

                }


                doc.setDrawColor(
                    220,
                    220,
                    220
                );


                doc.line(
                    15,
                    y + 2,
                    195,
                    y + 2
                );


                y += 8;

            }
        );

    }


    // ==============================
    // FALLBACK
    // ==============================

    else {

        // If passenger information wasn't
        // saved, still show seat information.

        seats.forEach(
            (seat, i) => {

                const seatNumber =
                    parseInt(seat);

                const seatClass =
                    !isNaN(seatNumber)
                        ? getSeatClass(seatNumber)
                        : "Economy";

                const fare =
                    Number(
                        seatClassPrice[seatClass] || 0
                    );

                totalFare += fare;


                doc.setFontSize(8);

                doc.setTextColor(
                    dark[0],
                    dark[1],
                    dark[2]
                );

                doc.text(
                    String(i + 1),
                    18,
                    y + 6
                );

                doc.text(
                    user.username ||
                    "Passenger",
                    30,
                    y + 6
                );

                doc.text(
                    "-",
                    95,
                    y + 6
                );

                doc.text(
                    seat,
                    115,
                    y + 6
                );

                doc.text(
                    seatClass,
                    140,
                    y + 6
                );

                doc.text(
                    "₹" + fare,
                    170,
                    y + 6
                );

                y += 12;

            }
        );

    }


    // ==============================
    // CONTACT DETAILS
    // ==============================

    y += 8;


    if (y > 245) {

        doc.addPage();

        y = 20;

    }


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);

    doc.text(
        "Contact Details",
        15,
        y
    );


    y += 7;


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);


    doc.text(
        "Email: " +
        (user.email || "-"),
        15,
        y
    );


    doc.text(
        "Phone: " +
        (
            passengers[0]?.phone ||
            "-"
        ),
        110,
        y
    );


    y += 15;


    // ==============================
    // TOTAL
    // ==============================

    doc.setFillColor(
        light[0],
        light[1],
        light[2]
    );


    doc.roundedRect(
        15,
        y,
        180,
        35,
        4,
        4,
        "F"
    );


    doc.setFontSize(9);

    doc.setTextColor(
        gray[0],
        gray[1],
        gray[2]
    );


    doc.text(
        "Payment Status",
        25,
        y + 11
    );


    doc.setTextColor(
        20,
        130,
        65
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "PAID",
        170,
        y + 11
    );


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );


    doc.setFontSize(13);

    doc.text(
        "Total Amount",
        25,
        y + 26
    );


    doc.setFontSize(16);

    doc.text(
        "₹" + totalFare,
        160,
        y + 26
    );


    // ==============================
    // FOOTER
    // ==============================

    y += 48;


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        gray[0],
        gray[1],
        gray[2]
    );


    doc.text(
        "Please arrive at the airport at least 2 hours before departure.",
        105,
        y,
        {
            align: "center"
        }
    );


    doc.text(
        "Please carry a valid government-issued ID.",
        105,
        y + 6,
        {
            align: "center"
        }
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.text(
        "Thank you for choosing DreamWings ✈",
        105,
        y + 14,
        {
            align: "center"
        }
    );


    // ==============================
    // DOWNLOAD
    // ==============================

    doc.save(
        "DreamWings-" +
        reference +
        "-Ticket.pdf"
    );

};


// ==========================================
// EXISTING LOGOUT
// ==========================================

document.getElementById('logout-btn').onclick = function() {

    localStorage.removeItem("dreamUser");

    document.getElementById(
        'profile-section'
    ).style.display = "none";

    document.getElementById(
        'admin-dashboard'
    ).style.display = "none";

    showRegisterModal();

};


// ==========================================
// EXISTING START BOOKING
// ==========================================

document.getElementById('start-booking-btn').onclick = function() {

    document.getElementById(
        'profile-section'
    ).style.display = "none";

    document.getElementById(
        'main-content'
    ).style.display = "block";

    showStep(0);

    renderSeatMap();

};


// ==========================================
// PROFILE BUTTON
// ==========================================

document.getElementById('profile-show-btn').onclick = function() {

    const user =
        JSON.parse(
            localStorage.getItem("dreamUser") || "{}"
        );


    if (user.username) {

        showProfile();

    } else {

        showLoginModal();

    }

};


// ==========================================
// REBOOK
// ==========================================

window.rebook = function(i) {

    const all =
        JSON.parse(
            localStorage.getItem('savedBookings') || '[]'
        );


    const user =
        JSON.parse(
            localStorage.getItem("dreamUser") || "{}"
        );


    const userBookings =
        all.filter(
            b => b.username === user.username
        );


    const b =
        userBookings[i];


    if (!b) {
        return;
    }


    selectedFlight = {

        airline: b.airline,

        from: b.from,

        to: b.to,

        date: b.date,

        price: b.price

    };


    showStep(0);


    document.getElementById(
        'fromInput'
    ).value = b.from;


    document.getElementById(
        'toInput'
    ).value = b.to;


    document.querySelector(
        '[name="date"]'
    ).value = b.date;

};

// ==== ADMIN DASHBOARD ====
document.getElementById('admin-btn').onclick = function() {
  document.getElementById('main-content').style.display = "none";
  document.getElementById('profile-section').style.display = "none";
  showAdminDashboard();
};
function showAdminDashboard() {
  document.getElementById('admin-dashboard').style.display = "block";
  let bookings = JSON.parse(localStorage.getItem('savedBookings') || "[]");
  let html = bookings.length
    ? bookings.map((b,i)=>
        `<div>
          <span><b>${b.airline}</b> | From: ${b.from} | To: ${b.to} | Date: ${b.date} | Seats: ${b.seats.join(', ')} | User: <b>${b.username}</b></span>
          <button class="main-btn" onclick="deleteBooking(${i})">Delete</button>
        </div>`
      ).join("")
    : "No bookings.";
  document.getElementById('admin-bookings').innerHTML = html;
}
window.deleteBooking = function(idx) {
  let bookings = JSON.parse(localStorage.getItem('savedBookings') || "[]");
  bookings.splice(idx, 1);
  localStorage.setItem('savedBookings', JSON.stringify(bookings));
  showAdminDashboard();
};
window.closeAdmin = function() {
  document.getElementById('admin-dashboard').style.display = "none";
  showProfile();
};

// ==== PROMO CODE ====
window.applyPromo = function() {
  const v = document.getElementById('promo-code').value.trim().toUpperCase();
  if (v == 'SAVE20') {
    promoDiscount = 0.8;
    document.getElementById('promo-status').textContent = "20% discount applied!";
  } else {
    promoDiscount = 1;
    document.getElementById('promo-status').textContent = "Invalid code.";
  }
};

// ==== SEARCH FLIGHTS ====
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.onsubmit = function(e) {
    e.preventDefault();
    showStep(0);
    const from = e.target.from.value, to = e.target.to.value, date = e.target.date.value;
    if (!from || !to || !date) {
      alert("Please enter all search fields!");
      return;
    }
    const flights = [
      { airline: 'IndiGo', from, to, date, price: 3200 },
      { airline: 'Air India', from, to, date, price: 5200 },
      { airline: 'Vistara', from, to, date, price: 5700 }
    ];
    const results = document.getElementById('flight-results');
    results.style.display = "flex";
    results.innerHTML = '';
    flights.forEach(flight => {
      const card = document.createElement('div');
      card.className = 'flight-card';
      card.innerHTML = `
        <span class="photo-badge">${flight.airline}</span>
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=64&q=80" alt="flight photo">
        <div class="airline-title">${flight.airline}</div>
        <p>${flight.from} → ${flight.to}</p>
        <p>Date: ${flight.date}</p>
        <p>Price: ₹${flight.price}</p>
        <button>Select</button>
      `;
      card.querySelector('button').onclick = () => {
        selectedFlight = flight; showStep(1);
        selectedSeats = []; occupiedSeats = [];
        renderSeatMap(); updateSeatSelectionInfo();
      };
      results.appendChild(card);
    });
  };
}

// ==== AIRPLANE SEATMAP ====
function getSeatClass(row) {
  if (row <= 2) return "first";
  if (row <= 4) return "business";
  return "economy";
}
function renderSeatMap() {
  const seatMapDiv = document.getElementById('seatMap');
  if (!seatMapDiv) return;
  seatMapDiv.innerHTML = `
    <svg viewBox="0 0 420 400" width="420" height="340" style="position:absolute;left:0;top:0;z-index:0;">
      <ellipse cx="210" cy="105" rx="195" ry="105" fill="#f5faff" stroke="#ccc" stroke-width="4"/>
      <rect x="29" y="110" width="362" height="220" rx="86" fill="#f9fbfc" stroke="#bbb" stroke-width="2"/>
      <ellipse cx="210" cy="330" rx="112" ry="36" fill="#e4f7fb" stroke="#b5dae8" stroke-width="2"/>
    </svg>
  `;
  const seatsWrap = document.createElement("div");
  seatsWrap.className = "all-seats-airplane";
  seatMapDiv.appendChild(seatsWrap);

  for (let row = 1; row <= seatRows; row++) {
    for (let col = 0; col < seatCols; col++) {
      let isSeat = false;
      if (row <= 2) { if (col === 1 || col === 2 || col === 5 || col === 6) isSeat = true; }
      else { if (col === 0 || col === 1 || col === 2 || col === 5 || col === 6 || col === 7) isSeat = true; }
      if (!isSeat) {
        const aisleDiv = document.createElement("div");
        aisleDiv.className = "seat-icon aisle";
        aisleDiv.innerHTML = "";
        seatsWrap.appendChild(aisleDiv);
        continue;
      }
      const seatId = `${row}${seatLabels[col]}`;
      const seatClass = getSeatClass(row);
      const seatDiv = document.createElement("div");
      seatDiv.className = "seat-icon seat-" + seatClass;
      seatDiv.innerText = seatLabels[col];
      seatDiv.setAttribute('data-tooltip', `${seatId} — ${seatClass[0].toUpperCase()+seatClass.slice(1)} — ₹${seatClassPrice[seatClass]}`);
      if (occupiedSeats.includes(seatId)) seatDiv.classList.add("occupied");
      if (selectedSeats.includes(seatId)) seatDiv.classList.add("selected");
      seatDiv.dataset.seatid = seatId;
      seatDiv.title = seatId + " (" + seatClass.charAt(0).toUpperCase() + seatClass.slice(1) + ")";
      seatDiv.onclick = function () {
        if (seatDiv.classList.contains("occupied") || seatDiv.classList.contains("aisle")) return;
        if (selectedSeats.includes(seatId)) {
          selectedSeats = selectedSeats.filter(s => s !== seatId);
        } else if (selectedSeats.length < 6) {
          selectedSeats.push(seatId);
          seatDiv.classList.add('animated');
          setTimeout(() => seatDiv.classList.remove('animated'), 390);
        }
        updateSeatSelectionInfo();
        document.getElementById('selectedSeatsInput').value = selectedSeats.join(",");
        renderSeatMap();
      };
      seatsWrap.appendChild(seatDiv);
    }
  }
}
function updateSeatSelectionInfo() {
  document.getElementById('seatSelectionInfo').innerHTML =
    selectedSeats.length ?
      `Selected seats: ${selectedSeats.join(", ")} | Total: ₹${selectedSeats.map(seat => seatClassPrice[getSeatClass(parseInt(seat))]).reduce((a,b)=>a+b,0)}` :
      "<span style='color:#c44'>Please select at least one seat.</span>";
}

// ==== PASSENGER DETAILS ====
const seatForm = document.getElementById('seatForm');
if (seatForm) {
  seatForm.onsubmit = function(e) {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      document.getElementById('seatSelectionInfo').innerHTML = "Select at least one seat!";
      return;
    }
    selectedTickets = selectedSeats.length;
    showStep(2);

    setTimeout(() => {
      const passengerForm = document.getElementById('passengerForm');
      if (!passengerForm) return;
      Array.from(passengerForm.children).forEach(child => {
        if (child.type !== "submit" && child.tagName !== "BUTTON") {
          child.remove();
        }
      });
      let passengerListWrap = document.getElementById('passenger-list-wrap');
      if (!passengerListWrap) {
        passengerListWrap = document.createElement('div');
        passengerListWrap.id = 'passenger-list-wrap';
        passengerForm.insertBefore(passengerListWrap, passengerForm.lastElementChild || null);
      }
      passengerListWrap.innerHTML = '<h3>Passenger Details (Required: ' + selectedTickets + ')</h3>';
      for (let i = 0; i < selectedTickets; i++) {
        passengerListWrap.innerHTML += `
          <div class="single-passenger">
            <b>Passenger ${i+1}:</b><br>
            <label>Name: <input type="text" name="name${i}" required class="input" /></label>
            <label>Age: <input type="number" name="age${i}" required class="input" min="0" /></label>
            <label>Type:
              <select name="type${i}" required class="input">
                <option value="">Select</option>
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
            </label>
            <label>Email: <input type="email" name="email${i}" required class="input" /></label>
            <label>Phone: <input type="tel" name="phone${i}" required class="input" /></label>
            <label>Passport No: <input type="text" name="passport${i}" class="input" /></label>
            <label>Country: <input type="text" name="country${i}" required class="input" /></label>
          </div>
        `;
      }
    }, 100);
  };
}
const passengerForm = document.getElementById('passengerForm');
if (passengerForm) {
  passengerForm.onsubmit = function(e) {
    e.preventDefault();
    let passengers = [];
    let adultCount = 0, childCount = 0;
    for (let i = 0; i < selectedTickets; i++) {
      let name = e.target[`name${i}`].value.trim();
      let email = e.target[`email${i}`].value.trim();
      let phone = e.target[`phone${i}`].value.trim();
      let passport = e.target[`passport${i}`].value.trim();
      let country = e.target[`country${i}`].value.trim();
      let type = e.target[`type${i}`].value;
      let age = e.target[`age${i}`].value;
      if (!name || !email || !phone || !country || !type) {
        alert(`Please fill all fields for passenger ${i+1}.`);
        return;
      }
      if (!/^[0-9]{10}$/.test(phone)) { alert(`Passenger ${i+1}: Phone must be 10 digits!`); return; }
      if (!/^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) { alert(`Passenger ${i+1}: Enter valid email.`); return; }
      if (type === "adult") adultCount++;
      if (type === "child") childCount++;
      passengers.push({ name, email, phone, passport, country, type, age });
    }
    passengerInfo = {
      tickets: selectedTickets,
      adults: adultCount,
      children: childCount,
      passengers
    };
    showStep(3);
    let total = selectedSeats.map(seat => seatClassPrice[getSeatClass(parseInt(seat))]).reduce((a,b)=>a+b,0);
    let billHtml = `<strong>Flight:</strong> ${selectedFlight.from} → ${selectedFlight.to} <br>
      <strong>Date:</strong> ${selectedFlight.date} <br>
      <strong>Seats:</strong> ${selectedSeats.join(", ")} <br>
      <strong>Adults:</strong> ${passengerInfo.adults} <br>
      <strong>Children:</strong> ${passengerInfo.children} <br>
      <strong>Tickets:</strong> ${passengerInfo.tickets} <br>
      <strong>Passenger Details:</strong><br>`;
    passengerInfo.passengers.forEach((p, idx) => {
      billHtml += `<div style="margin-bottom:8px;"><b>${p.type.charAt(0).toUpperCase()+p.type.slice(1)}: ${p.name}</b> | Age: ${p.age}, Email: ${p.email}</div>`;
    });
    billHtml += `<strong>Total Amount:</strong> <span id="bill-amount">₹${Math.round(total*promoDiscount)} ${(promoDiscount !== 1 ? "(Promo applied)" : "")}</span> <br>`;
    document.getElementById('bill-details').innerHTML = billHtml;
  };
}

// ==== BILL TO PAYMENT ====
document.getElementById('confirmBooking').onclick = function() {
  showStep(4);
  showPaymentRecap();
};
function saveUserBooking() {
  let user = JSON.parse(localStorage.getItem("dreamUser") || "{}");
  let bookings = JSON.parse(localStorage.getItem("savedBookings") || "[]");
  let booking = {
    username: user.username,
    airline: selectedFlight.airline,
    from: selectedFlight.from,
    to: selectedFlight.to,
    date: selectedFlight.date,
    seats: [...selectedSeats],
    price: selectedSeats.map(seat => seatClassPrice[getSeatClass(parseInt(seat))]).reduce((a,b)=>a+b,0),
    passengers: passengerInfo.passengers
  };
  bookings.push(booking);
  localStorage.setItem("savedBookings", JSON.stringify(bookings));
}


// ==== PAYMENT (CARD & UPI) ====
const card3d = document.getElementById('credit-card-3d');
document.getElementById('card-number').oninput = function() {
  let val = this.value.replace(/\D/g,"").substr(0,16).replace(/(.{4})/g,"$1 ").trim();
  this.value = val;
  document.getElementById('cc-num').textContent = val.padEnd(19,'•');
  let v = val.replace(/\s/g,'');
  let logo = "", brand = "";
  if (v.startsWith('4')) { logo='https://img.icons8.com/color/48/000000/visa.png'; brand = "VISA"; }
  else if (/^5[1-5]/.test(v)) { logo='https://img.icons8.com/color/48/000000/mastercard.png'; brand = "Mastercard"; }
  else if (/^3[47]/.test(v)) { logo='https://img.icons8.com/color/48/000000/amex.png'; brand = "AMEX"; }
  document.getElementById('cc-logo-img').src = logo || '';
  document.getElementById('cc-brand-name').textContent = brand || '';
};
document.getElementById('card-name-input').oninput = function() {
  document.getElementById('cc-name').textContent = this.value || "NAME";
};
document.getElementById('card-exp').oninput = function() {
  let v = this.value.replace(/\D/g,"").substr(0,4);
  if(v.length>2) v = v.substr(0,2)+"/"+v.substr(2,2);
  this.value = v;
  document.getElementById('cc-exp').textContent = v || '••/••';
};
document.getElementById('card-cvv').onfocus = function() { card3d.classList.add('flipped'); };
document.getElementById('card-cvv').onblur = function() { card3d.classList.remove('flipped'); };
document.getElementById('card-cvv').oninput = function() {
  let cvv = this.value.replace(/\D/g,"").substr(0,4);
  this.value = cvv;
  document.getElementById('cc-cvv').textContent = cvv.replace(/./g,'•').padEnd(3,'•');
};

document.getElementById('tab-card').onclick = function() {
  document.getElementById('card-details-wrap').style.display = "";
  document.getElementById('pay-upi').style.display = "none";
  this.classList.add("active");
  document.getElementById('tab-upi').classList.remove("active");
};
document.getElementById('tab-upi').onclick = function() {
  document.getElementById('card-details-wrap').style.display = "none";
  document.getElementById('pay-upi').style.display = "";
  this.classList.add("active");
  document.getElementById('tab-card').classList.remove("active");
};

document.getElementById('pay-card').onsubmit = function(e){
  e.preventDefault();
  let num = document.getElementById('card-number').value.replace(/\s+/g,"");
  let exp = document.getElementById('card-exp').value.trim();
  let cvv = document.getElementById('card-cvv').value.trim();
  let name = document.getElementById('card-name-input').value.trim();
  if(!/^\d{13,16}$/.test(num)) { document.getElementById('card-error').textContent = "Enter a valid card number (13-16 digits)."; return; }
  if(!/^\d{2}\/\d{2}$/.test(exp)) { document.getElementById('card-error').textContent = "Enter expiry as MM/YY."; return; }
  let mm = parseInt(exp.slice(0,2)), yy = parseInt(exp.slice(3,5)), now = new Date(), curYY = now.getFullYear()%100, curMM = now.getMonth()+1;
  if(mm < 1 || mm > 12) { document.getElementById('card-error').textContent = "Expiry month must be 01–12."; return; }
  if ((yy < curYY) || (yy === curYY && mm < curMM)) { document.getElementById('card-error').textContent = "Card has expired."; return; }
  if(!/^\d{3,4}$/.test(cvv)) { document.getElementById('card-error').textContent = "CVV must be 3 or 4 digits."; return; }
  if (name.length < 2) { document.getElementById('card-error').textContent = "Enter the name as on card."; return;}
  document.getElementById('card-error').textContent = "";
  document.getElementById('pay-card').style.display="none";
  document.getElementById('pay-upi').style.display="none";
  document.getElementById('pay-success').style.display="";
  saveUserBooking();

  showNotification("Booking Confirmed!","Your DreamWings flight is booked.\nPayment successful.","https://img.icons8.com/fluency/48/airplane-take-off.png");
  setTimeout(() => {
    showNotification("Upcoming Flight Reminder","Your flight from " + selectedFlight.from + " to " + selectedFlight.to + " is coming up soon!","https://img.icons8.com/color/48/000000/airplane-take-off.png");
  }, 8000);

  card3d.style.transition="transform 0.6s cubic-bezier(.64,-0.07,.18,.99), box-shadow 0.6s";
  card3d.style.transform="scale(1.13) rotate(-11deg) translateY(-22px)";
  card3d.style.boxShadow = "0 38px 100px #4F31A9cc";
  setTimeout(() => {
    card3d.style.transform = "scale(0.83) rotate(-19deg) translateY(-135px)";
    card3d.style.boxShadow = "0 12px 38px #2A155E77";
  }, 400);
  setTimeout(() => {
    card3d.style.transform = "";
    card3d.style.boxShadow = "";
  }, 1500);
};

document.getElementById('pay-upi').onsubmit = function(e){
  e.preventDefault();
  let upi = document.getElementById('upi-id').value.trim();
  let provider = document.getElementById('upi-app-label').textContent;
  if(!upi.match(/^[\w.\-_]{2,20}@[\w]{2,20}$/)) {
    document.getElementById('upi-error').textContent = "Invalid UPI ID format.";
    return;
  }
  document.getElementById('pay-card').style.display="none";
  document.getElementById('pay-upi').style.display="none";
  document.getElementById('pay-success').style.display="";
  saveUserBooking();

  const passenger = passengerInfo.passengers[0];

const bookingMessage = `
✈️ Airline: ${selectedFlight.airline}

From: ${selectedFlight.from}
To: ${selectedFlight.to}

📅 Date: ${selectedFlight.date}

👤 Passenger: ${passenger.name}

💺 Seat(s): ${selectedSeats.join(", ")}

📧 Email: ${passenger.email}

💳 Payment: Successful

Your booking has been confirmed.
Please check your ticket details in Profile.

Have a safe and pleasant journey! ✈️
`;

showNotification(
    "🎉 Booking Confirmed!",
    bookingMessage,
    "https://img.icons8.com/fluency/48/airplane-take-off.png"
);
  setTimeout(() => {
    showNotification("Upcoming Flight Reminder!","Your payment was successful. Remember to check ticket details in Profile.","https://img.icons8.com/fluency/48/ticket.png");
  }, 9000);
};
const upiSymbols = {
  "Paytm": "₹",
  "PhonePe": "🟪",
  "Google Pay": "🟦",
  "BHIM": "▲"
};
const upiColors = {
  "Paytm": "#095cfc",
  "PhonePe": "#6f51ff",
  "Google Pay": "#4285f4",
  "BHIM": "#11a540"
};
document.querySelectorAll('.upi-symbol-btn').forEach(btn=>{
  btn.onclick = function() {
    let sel = this.getAttribute('data-app');
    document.getElementById('upi-choice-screen').style.display="none";
    document.getElementById('upi-id-screen').style.display="";
    document.getElementById('upi-app-symbol').textContent = upiSymbols[sel];
    document.getElementById('upi-app-label').textContent = sel;
    document.getElementById('upi-app-symbol').style.background=upiColors[sel];
    document.getElementById('upi-app-symbol').setAttribute('data-app', sel);
    document.getElementById('upi-id').value = "";
    document.getElementById('upi-error').textContent = "";
  };
});
document.getElementById('upi-back-btn').onclick = function() {
  document.getElementById('upi-choice-screen').style.display="";
  document.getElementById('upi-id-screen').style.display="none";
};

function showPaymentRecap() {
  document.getElementById('payment-recap').innerHTML = "";
}
document.body.addEventListener('click', function(e) {
  if (e.target && e.target.id === "downloadTicketAfterPay") {
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      alert("jsPDF not loaded, cannot download ticket.");
      return;
    }
    function get(val, fallback="") { return (val && String(val).trim()) || fallback; }
    const user = JSON.parse(localStorage.getItem("dreamUser") || "{}");
    const bookingsArr = JSON.parse(localStorage.getItem("savedBookings") || "[]");
    const lastBooking = bookingsArr.filter(b => b.username === user.username).slice(-1)[0] || {};
    const passengerArr =
      (window.passengerInfo && window.passengerInfo.passengers) ||
      (lastBooking.passengers) || [];
    const flight = window.selectedFlight || lastBooking || {};
    const seatsArr = window.selectedSeats && window.selectedSeats.length ? window.selectedSeats
      : (Array.isArray(lastBooking.seats) ? lastBooking.seats : []);
    const seatClass = seatsArr.length ? getSeatClass(parseInt(seatsArr[0])).toUpperCase() : "-";
    const pricePerSeat = seatsArr.length && selectedFlight ? String(selectedFlight.price) : (lastBooking.price ? String(lastBooking.price) : "-");
    const baseTotal = seatsArr.length ? seatsArr.map(seat => seatClassPrice[getSeatClass(parseInt(seat))]).reduce((a,b)=>a+b,0) : (lastBooking.price || 0);
    const promo = (typeof window.promoDiscount === "number" ? window.promoDiscount : 1);
    const totalPaid = Math.round(baseTotal * promo);

    let reference = "DW-" + Math.random().toString(36).substr(2,8).toUpperCase();
    let date = get(flight.date, "-");
    let seats = seatsArr.length ? seatsArr.join(', ') : "-";

    let ticketLines = [
      "DreamWings E-Ticket", "",
      `Booking Reference (PNR): ${reference}`,
      `Airline:     ${get(flight.airline, "-")}`,
      `Flight Date: ${date}`,
      `From:        ${get(flight.from, "-")}`,
      `To:          ${get(flight.to, "-")}`,
      `Seat(s):     ${seats}`,
      `Class:       ${seatClass}`,
      `Fare per Seat: ₹${pricePerSeat}`,
      `Total Paid:  ₹${totalPaid}`,
      `Payment:     SUCCESS`, "",
      "Passenger Details:",
    ];
    passengerArr.forEach((p, idx) => {
      ticketLines.push(
        `Passenger #${idx+1}: ${get(p.name, "-")}`,
        `  Age:      ${get(p.age, "-")}`,
        `  Type:     ${get(p.type, "-")}`,
        `  Email:    ${get(p.email, "-")}`,
        `  Phone:    ${get(p.phone, "-")}`,
        `  Country:  ${get(p.country, "-")}`,
        `  Passport: ${get(p.passport, "-")}`,
        ""
      );
    });
    ticketLines.push(
      "",
      "Thank you for booking with DreamWings.",
      "For help: support@dreamwings.com"
    );
    let doc = new window.jspdf.jsPDF({ format: 'a5', orientation: 'landscape' });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(ticketLines[0], 14, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 35, maxY = 190;
    for (let i = 1; i < ticketLines.length; ++i) {
      let addSpacing = ticketLines[i]==="" ? 6 : 8.2;
      if (y + addSpacing > maxY) {
        doc.addPage();
        y = 22;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
      }
      doc.text(ticketLines[i], 14, y);
      y += addSpacing;
    }
    doc.save("DreamWings-Ticket.pdf");
  }
});

// ==== TEAM SECTION (CAROUSEL + PROFILE VIEW) ====
const teamMembers = [
  {
    name: "MALLAMPALLI HEMASEKHAR",
    image: "images/hemasekhar1.jpg",
    role: "Frontend and Backend Developer Lead",
    desc: "Hi Iam MALLAMPALLI HEMASEKHAR, Frontend and Backend Developer Lead at DreamWings.I build beautiful and responsive user interfaces.",
    extra: "Iam II year B-tech Student at SR University.<br>Roll.no:2403a51378 <br>skills: HTML, CSS, JavaScript(Beginner),node.js(Beginner)",
  },
  {
    name: "CH.KASI AMARNADH",
    image: "images/amul.jpg",
    role: "UI/UX Web Designer",
    desc: "Hi Iam CH.KASI AMARNADH, UI/UX Web Designer at DreamWings. <br>I design user-friendly and engaging web experiences.",
    extra: "Iam II year B-tech Student at SR University.<br>Roll.no:2403a51388 <br>skills: Figma (Beginner), Adobe XD, Photoshop(Beginner)",
  },
  {
    name: "POTU ANVESH",
    image: "images/anvesh.jpg",
    role: "Q/A Tester and Content manager ",
    desc: "Hi Iam POTU ANVESH,Q/A tester and content manager at DreamWings. <br>I develop robust server-side logic and database management.",
    extra: "Iam II year B-tech Student at SR University.<br>Roll.no:2403a51382 <br>skills: node.js, express.js(beginner), MongoDB(Beginner)",
  },
  {
    name: "MADDISETTY JITHENDRA",
    image: "images/jithu.jpg",
    role: "Backend Database",
    desc:  "Hi Iam MADDISETTY JITHENDRA, Backend Database at DreamWings. <br>I handle database design, optimization, and data integrity.",
    extra: "Iam II year B-tech Student at SR University.<br>Roll.no:2403a51389 <br>skills: SQL,My SQL, MongoDB(Beginner)",
  },
  {
    name: "B NIKHIL KUMAR",
    image: "images/nikhil.jpg",
    role: "Research and Development",
    desc: "Hi Iam B NIKHIL KUMAR, Research and Development at DreamWings. <br>I explore new technologies and implement innovative solutions.",
    extra: "Iam II year B-tech Student at SR University.<br>Roll.no:2403a51377 <br>skills: Python(Beginner),c",
  }
];

let teamCarouselInterval = null;
let autoScroll = true;
let teamAt = 0;
const SCROLL_SPEED = 2;

function renderTeamCarousel() {
  const wrap = document.getElementById('team-carousel');
  wrap.innerHTML = "";
  teamMembers.forEach((m, i) => {
    wrap.innerHTML += `
      <div class="team-card" data-idx="${i}">
        <img src="${m.image}" alt="${m.name}" />
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role}</div>
        <div class="team-desc">${m.desc}</div>
      </div>
    `;
  });
}
function setupTeamCarousel() {
  renderTeamCarousel();
  const wrap = document.getElementById('team-carousel');
  let itemWidth = 260 + 36;
  teamAt = 0;
  wrap.style.transform = 'translateX(0)';
  let totalWidth = itemWidth * teamMembers.length;
  function scrollLoop() {
    if (!autoScroll) return;
    teamAt -= SCROLL_SPEED;
    if (Math.abs(teamAt) >= totalWidth) teamAt = 0;
    wrap.style.transform = `translateX(${teamAt}px)`;
  }
  if (teamCarouselInterval) clearInterval(teamCarouselInterval);
  teamCarouselInterval = setInterval(scrollLoop, 22);
  wrap.appendChild(wrap.children[0].cloneNode(true));
  wrap.querySelectorAll('.team-card').forEach(card => {
    card.onclick = (e) => {
      autoScroll = false;
      showTeamProfile(parseInt(card.getAttribute("data-idx")));
    };
  });
}
function showTeamProfile(idx) {
  const member = teamMembers[idx];
  const det = document.getElementById('team-detail-view');
  det.innerHTML = `
    <img src="${member.image}" alt="${member.name}" />
    <div class="team-detail-name">${member.name}</div>
    <div class="team-detail-role">${member.role}</div>
    <div class="team-detail-desc">${member.desc}</div>
    ${member.extra ? `<div class="team-detail-extra">${member.extra}</div>` : ""}
  `;
  det.style.display = "";
  document.getElementById('team-carousel').style.display = "none";
  document.getElementById('team-back-btn').style.display = "";
  document.getElementById('team-exit-btn').style.display = "none";
  document.getElementById('team-back-btn').onclick = function() {
    det.style.display = "none";
    document.getElementById('team-carousel').style.display = "";
    document.getElementById('team-back-btn').style.display = "none";
    document.getElementById('team-exit-btn').style.display = "";
    autoScroll = true;
  };
}
const showTeamStepIndex = steps.indexOf("team-section");
const teamNav = document.querySelector('a[href="#team-section"]');
if (teamNav) {
  teamNav.onclick = function(e) {
    e.preventDefault();
    showStep(showTeamStepIndex);
    autoScroll = true;
    document.getElementById('team-detail-view').style.display = "none";
    document.getElementById('team-carousel').style.display = "";
    document.getElementById('team-back-btn').style.display = "none";
    document.getElementById('team-exit-btn').style.display = "";
    setupTeamCarousel();
  };
}

// ==========================================
// DREAMWINGS NOTIFICATION BELL SYSTEM
// ==========================================

const notificationButton =
    document.getElementById("notification-btn");

const notificationPanel =
    document.getElementById("notification-panel");

const notificationCount =
    document.getElementById("notification-count");

const notificationList =
    document.getElementById("notification-list");

const clearNotifications =
    document.getElementById("clear-notifications");


// Store notifications

let dreamWingsNotifications = [];


// ==========================================
// OPEN NOTIFICATION PANEL
// ==========================================

notificationButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        if (
            notificationPanel.style.display === "block"
        ) {

            notificationPanel.style.display = "none";

        } else {

            notificationPanel.style.display = "block";

        }

    }
);


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".notification-container"
            )
        ) {

            notificationPanel.style.display =
                "none";

        }

    }
);


// ==========================================
// ADD NOTIFICATION TO BELL
// ==========================================

function addBellNotification(
    title,
    message,
    icon
) {

    const notification = {

        title: title,

        message: message,

        icon: icon,

        time: "Just now"

    };


    dreamWingsNotifications.unshift(
        notification
    );


    displayBellNotifications();

}


// ==========================================
// DISPLAY NOTIFICATIONS
// ==========================================

function displayBellNotifications() {

    notificationList.innerHTML = "";


    // No notifications

    if (
        dreamWingsNotifications.length === 0
    ) {

        notificationList.innerHTML = `

            <div class="no-notifications">

                🔔 No new notifications

            </div>

        `;

        notificationCount.innerText = "0";

        return;

    }


    // Notification count

    notificationCount.innerText =
        dreamWingsNotifications.length;


    // Display notifications

    dreamWingsNotifications.forEach(
        function (notification) {

            const item =
                document.createElement("div");


            item.className =
                "notification-item";


            item.innerHTML = `

                <img
                    class="notification-icon"
                    src="${notification.icon}"
                    alt="Notification"
                >


                <div class="notification-content">

                    <div class="notification-title">

                        ${notification.title}

                    </div>


                    <div class="notification-message">

                        ${notification.message}

                    </div>


                    <div class="notification-time">

                        ${notification.time}

                    </div>

                </div>

            `;


            notificationList.appendChild(
                item
            );

        }
    );

}


// ==========================================
// CLEAR ALL
// ==========================================

clearNotifications.addEventListener(
    "click",
    function () {

        dreamWingsNotifications = [];

        displayBellNotifications();

    }
);

const originalShowNotification =
    window.showNotification;


window.showNotification = function (
    title,
    message,
    icon
) {

    // Run your existing notification
    if (
        typeof originalShowNotification ===
        "function"
    ) {

        originalShowNotification(
            title,
            message,
            icon
        );

    }


    // Add notification to bell

    addBellNotification(
        title,
        message,
        icon
    );

};
// =================== END DreamWings script.js ===================
