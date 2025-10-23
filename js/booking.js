// ==================== BOOKING FUNCTIONALITY ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeBooking();
    generateTimeSlots();
    setupBookingFormListeners();
});

const PRICING = {
    'football-full': { price: 1000, advance: 300 },
    'football-half': { price: 600, advance: 200 },
    'cricket': { price: 1000, advance: 300 }
};

let selectedSlots = [];
let selectedTurfType = null;

function initializeBooking() {
    // Set minimum date to today
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today;
    }
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const turfType = urlParams.get('type');
    if (turfType) {
        const turfRadio = document.querySelector(`input[name="turfType"][value="${turfType}"]`);
        if (turfRadio) {
            turfRadio.checked = true;
            selectedTurfType = turfType;
            updateSummary();
        }
    }
    
    // Load existing bookings
    loadAvailableSlots();
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer) return;
    
    const slots = [];
    
    // Generate slots from 5 AM to 12 AM (midnight)
    for (let hour = 5; hour <= 23; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push({
            start: startTime,
            end: endTime,
            display: `${formatTime(startTime)} - ${formatTime(endTime)}`
        });
    }
    
    timeSlotsContainer.innerHTML = slots.map(slot => `
        <div class="time-slot" data-slot="${slot.start}">
            ${slot.display}
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('booked')) return;
            
            this.classList.toggle('selected');
            const slotTime = this.getAttribute('data-slot');
            
            if (this.classList.contains('selected')) {
                selectedSlots.push(slotTime);
            } else {
                selectedSlots = selectedSlots.filter(s => s !== slotTime);
            }
            
            updateSummary();
        });
    });
}

function setupBookingFormListeners() {
    // Turf type selection
    document.querySelectorAll('input[name="turfType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedTurfType = this.value;
            updateSummary();
        });
    });
    
    // Date selection
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            loadAvailableSlots();
            updateSummary();
        });
    }
    
    // Recurring booking checkbox
    const recurringCheckbox = document.getElementById('recurringBooking');
    if (recurringCheckbox) {
        recurringCheckbox.addEventListener('change', function() {
            const recurringOptions = document.getElementById('recurringOptions');
            recurringOptions.style.display = this.checked ? 'block' : 'none';
            updateSummary();
        });
    }
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processBooking();
        });
    }
}

function loadAvailableSlots() {
    const dateInput = document.getElementById('bookingDate');
    const availableSlotsList = document.getElementById('availableSlotsList');
    
    if (!dateInput || !availableSlotsList) return;
    
    const selectedDate = dateInput.value;
    if (!selectedDate) return;
    
    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const dateBookings = bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled');
    
    // Mark booked slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        const slotTime = slot.getAttribute('data-slot');
        const isBooked = dateBookings.some(booking => 
            booking.slots.includes(slotTime) && 
            (!selectedTurfType || booking.turfType === selectedTurfType)
        );
        
        if (isBooked) {
            slot.classList.add('booked');
            slot.classList.remove('selected');
        } else {
            slot.classList.remove('booked');
        }
    });
    
    // Update sidebar
    const totalSlots = 19; // 5 AM to 12 AM = 19 slots
    const bookedSlots = dateBookings.reduce((acc, b) => acc + b.slots.length, 0);
    const availableSlots = totalSlots - bookedSlots;
    
    availableSlotsList.innerHTML = `
        <div class="availability-info">
            <p><strong>Date:</strong> ${formatDate(selectedDate)}</p>
            <p><strong>Available Slots:</strong> ${availableSlots}/${totalSlots}</p>
            ${selectedTurfType ? `<p><strong>Turf:</strong> ${getTurfTypeName(selectedTurfType)}</p>` : ''}
        </div>
    `;
}

function updateSummary() {
    if (!selectedTurfType || selectedSlots.length === 0) {
        document.getElementById('summaryTurfType').textContent = '-';
        document.getElementById('summaryDate').textContent = '-';
        document.getElementById('summarySlots').textContent = '-';
        document.getElementById('summaryHours').textContent = '0';
        document.getElementById('summaryTotal').textContent = '₹0';
        document.getElementById('summaryAdvance').textContent = '₹0';
        document.getElementById('summaryRemaining').textContent = '₹0';
        return;
    }
    
    const pricing = PRICING[selectedTurfType];
    const hours = selectedSlots.length;
    const total = pricing.price * hours;
    const advance = pricing.advance * hours;
    const remaining = total - advance;
    
    const dateInput = document.getElementById('bookingDate');
    const selectedDate = dateInput ? dateInput.value : '';
    
    const recurringBooking = document.getElementById('recurringBooking');
    const isRecurring = recurringBooking ? recurringBooking.checked : false;
    
    document.getElementById('summaryTurfType').textContent = getTurfTypeName(selectedTurfType);
    document.getElementById('summaryDate').textContent = selectedDate ? formatDate(selectedDate) : '-';
    document.getElementById('summarySlots').textContent = selectedSlots.length;
    document.getElementById('summaryHours').textContent = hours + (isRecurring ? ' (per week)' : '');
    document.getElementById('summaryTotal').textContent = formatCurrency(total);
    document.getElementById('summaryAdvance').textContent = formatCurrency(advance);
    document.getElementById('summaryRemaining').textContent = formatCurrency(remaining);
}

function getTurfTypeName(type) {
    const names = {
        'football-full': 'Football - Full Court',
        'football-half': 'Football - Half Court',
        'cricket': 'Cricket Turf'
    };
    return names[type] || type;
}

function processBooking() {
    // Validate form
    if (!selectedTurfType) {
        alert('Please select a turf type');
        return;
    }
    
    if (selectedSlots.length === 0) {
        alert('Please select at least one time slot');
        return;
    }
    
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPhone = document.getElementById('userPhone').value;
    const bookingDate = document.getElementById('bookingDate').value;
    
    if (!userName || !userEmail || !userPhone || !bookingDate) {
        alert('Please fill all required fields');
        return;
    }
    
    const pricing = PRICING[selectedTurfType];
    const total = pricing.price * selectedSlots.length;
    const advance = pricing.advance * selectedSlots.length;
    
    // Create booking object
    const booking = {
        id: 'BK' + Date.now(),
        userName,
        userEmail,
        userPhone,
        turfType: selectedTurfType,
        date: bookingDate,
        slots: [...selectedSlots],
        total,
        advance,
        remaining: total - advance,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Store booking temporarily
    sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
    
    // Process payment
    initiatePayment(booking);
}

function initiatePayment(booking) {
    // Razorpay Integration
    const options = {
        key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
        amount: booking.advance * 100, // Amount in paise
        currency: 'INR',
        name: 'Algus Football Turf',
        description: `Booking for ${getTurfTypeName(booking.turfType)}`,
        image: 'https://your-logo-url.com/logo.png',
        handler: function (response) {
            booking.paymentId = response.razorpay_payment_id;
            booking.status = 'confirmed';
            
            // Save booking
            saveBooking(booking);
            
            // Send confirmation email/SMS
            sendConfirmation(booking);
            
            // Redirect to success page
            alert('Booking confirmed! Payment ID: ' + response.razorpay_payment_id);
            window.location.href = 'user-dashboard.html';
        },
        prefill: {
            name: booking.userName,
            email: booking.userEmail,
            contact: booking.userPhone
        },
        theme: {
            color: '#10b981'
        }
    };
    
    const razorpay = new Razorpay(options);
    razorpay.on('payment.failed', function (response) {
        alert('Payment failed! Please try again.');
        console.error(response.error);
    });
    
    razorpay.open();
}

function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    sessionStorage.removeItem('pendingBooking');
}

function sendConfirmation(booking) {
    // This would integrate with your backend to send email/SMS
    console.log('Sending confirmation for booking:', booking.id);
    
    // Email notification (integrate with backend API)
    // SMS notification (integrate with backend API)
    
    // For now, just log it
    const message = `
        Booking Confirmed!
        Booking ID: ${booking.id}
        Date: ${formatDate(booking.date)}
        Turf: ${getTurfTypeName(booking.turfType)}
        Time Slots: ${booking.slots.length}
        Amount Paid: ${formatCurrency(booking.advance)}
        Remaining: ${formatCurrency(booking.remaining)}
    `;
    
    console.log(message);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}