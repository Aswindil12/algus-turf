// ==================== ADMIN FUNCTIONALITY ====================
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin')) {
        initializeAdmin();
    }
});

function initializeAdmin() {
    loadDashboardStats();
    loadRecentBookings();
    loadAllBookings();
    initializeCharts();
}

// ==================== DASHBOARD ====================
function loadDashboardStats() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
    const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date() && b.status === 'confirmed');
    
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.advance, 0);
    
    // Update stats cards
    const todayBookingsEl = document.getElementById('todayBookings');
    const todayRevenueEl = document.getElementById('todayRevenue');
    const upcomingBookingsEl = document.getElementById('upcomingBookings');
    const totalUsersEl = document.getElementById('totalUsers');
    
    if (todayBookingsEl) todayBookingsEl.textContent = todayBookings.length;
    if (todayRevenueEl) todayRevenueEl.textContent = formatCurrency(todayRevenue);
    if (upcomingBookingsEl) upcomingBookingsEl.textContent = upcomingBookings.length;
    if (totalUsersEl) totalUsersEl.textContent = users.length;
}

function loadRecentBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const recentBookings = bookings.slice(-10).reverse();
    
    const tableBody = document.getElementById('recentBookingsTable');
    if (!tableBody) return;
    
    if (recentBookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = recentBookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${booking.userName}</td>
            <td>${getTurfTypeName(booking.turfType)}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.slots[0]} - ${booking.slots[booking.slots.length - 1]}</td>
            <td>${formatCurrency(booking.total)}</td>
            <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewBooking('${booking.id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== BOOKINGS MANAGEMENT ====================
function loadAllBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const tableBody = document.getElementById('bookingsTable');
    
    if (!tableBody) return;
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">No bookings yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bookings.reverse().map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.userName}</td>
            <td>${booking.userPhone}</td>
            <td>${getTurfTypeName(booking.turfType)}</td>
            <td>${booking.slots.length} slots</td>
            <td>${formatCurrency(booking.total)}</td>
            <td>${formatCurrency(booking.advance)}</td>
            <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewBooking('${booking.id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editBooking('${booking.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="cancelBooking('${booking.id}')" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewBooking(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found');
        return;
    }
    
    alert(`
        Booking Details:
        ID: ${booking.id}
        Customer: ${booking.userName}
        Email: ${booking.userEmail}
        Phone: ${booking.userPhone}
        Turf: ${getTurfTypeName(booking.turfType)}
        Date: ${formatDate(booking.date)}
        Slots: ${booking.slots.join(', ')}
        Total: ${formatCurrency(booking.total)}
        Paid: ${formatCurrency(booking.advance)}
        Remaining: ${formatCurrency(booking.remaining)}
        Status: ${booking.status}
    `);
}

function editBooking(bookingId) {
    alert('Edit functionality will be implemented');
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
        alert('Booking not found');
        return;
    }
    
    bookings[bookingIndex].status = 'cancelled';
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert('Booking cancelled successfully');
    loadAllBookings();
    loadDashboardStats();
}

function applyFilters() {
    const filterDate = document.getElementById('filterDate').value;
    const filterTurfType = document.getElementById('filterTurfType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    if (filterDate) {
        bookings = bookings.filter(b => b.date === filterDate);
    }
    
    if (filterTurfType) {
        bookings = bookings.filter(b => b.turfType === filterTurfType);
    }
    
    if (filterStatus) {
        bookings = bookings.filter(b => b.status === filterStatus);
    }
    
    // Update table with filtered data
    const tableBody = document.getElementById('bookingsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.userName}</td>
            <td>${booking.userPhone}</td>
            <td>${getTurfTypeName(booking.turfType)}</td>
            <td>${booking.slots.length} slots</td>
            <td>${formatCurrency(booking.total)}</td>
            <td>${formatCurrency(booking.advance)}</td>
            <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewBooking('${booking.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function exportBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const csv = convertToCSV(bookings);
    downloadCSV(csv, 'bookings.csv');
}

// ==================== PRICING MANAGEMENT ====================
function updatePricing(turfType) {
    alert(`Updating pricing for ${getTurfTypeName(turfType)}`);
    // Implement pricing update logic
}

// ==================== REPORTS ====================
function generateReport() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both dates');
        return;
    }
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const filteredBookings = bookings.filter(b => {
        return b.date >= fromDate && b.date <= toDate && b.status !== 'cancelled';
    });
    
    // Calculate stats
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.total, 0);
    
    // Update stats
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    // Generate detailed report
    generateDetailedReport(filteredBookings);
}

function generateDetailedReport(bookings) {
    // Group by date
    const dateGroups = {};
    
    bookings.forEach(booking => {
        if (!dateGroups[booking.date]) {
            dateGroups[booking.date] = {
                footballFull: 0,
                footballHalf: 0,
                cricket: 0,
                revenue: 0
            };
        }
        
        if (booking.turfType === 'football-full') dateGroups[booking.date].footballFull++;
        if (booking.turfType === 'football-half') dateGroups[booking.date].footballHalf++;
        if (booking.turfType === 'cricket') dateGroups[booking.date].cricket++;
        
        dateGroups[booking.date].revenue += booking.total;
    });
    
    const tableBody = document.getElementById('detailedReportTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = Object.entries(dateGroups).map(([date, data]) => {
        const total = data.footballFull + data.footballHalf + data.cricket;
        return `
            <tr>
                <td>${formatDate(date)}</td>
                <td>${total}</td>
                <td>${data.footballFull}</td>
                <td>${data.footballHalf}</td>
                <td>${data.cricket}</td>
                <td>${formatCurrency(data.revenue)}</td>
                <td>-</td>
            </tr>
        `;
    }).join('');
}

function exportReport() {
    alert('Exporting report as PDF...');
    // Implement PDF export
}

// ==================== CHARTS ====================
function initializeCharts() {
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
        initRevenueChart();
    }
    
    const turfTypeChart = document.getElementById('turfTypeChart');
    if (turfTypeChart) {
        initTurfTypeChart();
    }
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Group by month
    const monthlyData = {};
    bookings.forEach(booking => {
        const month = booking.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month] += booking.total;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Revenue',
                data: Object.values(monthlyData),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initTurfTypeChart() {
    const ctx = document.getElementById('turfTypeChart').getContext('2d');
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const counts = {
        'football-full': 0,
        'football-half': 0,
        'cricket': 0
    };
    
    bookings.forEach(booking => {
        counts[booking.turfType]++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Football Full', 'Football Half', 'Cricket'],
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ==================== HELPER FUNCTIONS ====================
function getTurfTypeName(type) {
    const names = {
        'football-full': 'Football - Full Court',
        'football-half': 'Football - Half Court',
        'cricket': 'Cricket Turf'
    };
    return names[type] || type;
}

function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function convertToCSV(data) {
    // Simple CSV conversion
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}