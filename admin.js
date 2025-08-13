// DOM elements
let currentSection = 'dashboard';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    
    // Initialize charts
    initCharts();
});

function setupEventListeners() {
    // Sidebar navigation
    const navLinks = document.querySelectorAll('.admin-sidebar nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Get section ID
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Add new product button
    const addProductBtn = document.querySelector('.products-section .btn-primary');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }
    
    // Edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const productItem = e.target.closest('.product-item');
            editProduct(productItem);
        } else if (e.target.classList.contains('delete-btn')) {
            const productItem = e.target.closest('.product-item');
            deleteProduct(productItem);
        }
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update header
    const header = document.querySelector('.admin-header h1');
    if (header) {
        header.textContent = 
            sectionId === 'dashboard' ? 'Dashboard' :
            sectionId === 'products' ? 'Products' :
            sectionId === 'orders' ? 'Orders' :
            sectionId === 'customers' ? 'Customers' :
            sectionId === 'analytics' ? 'Analytics' :
            sectionId === 'settings' ? 'Settings' : 'Dashboard';
    }
    
    currentSection = sectionId;
}

async function loadDashboardData() {
    try {
        // In a real app, we would fetch this data from the API
        // For now, we'll use the data already in the page
        
        // Update stats with animated counters
        animateCounter('Total Revenue', 24589, '$');
        animateCounter('Total Orders', 156, '');
        animateCounter('New Customers', 42, '');
        animateCounter('Pending Orders', 8, '');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function animateCounter(title, targetValue, prefix = '') {
    const statCard = document.querySelector(`.stat-info h3:nth-child(1):not(:has(+ .stat-value))`);
    const statElement = document.querySelector(`.stat-info h3:-soup-contains("${title}") ~ .stat-value`);
    
    if (statElement) {
        let currentValue = 0;
        const duration = 1500; // ms
        const steps = 60;
        const increment = targetValue / (duration / (1000 / steps));
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            statElement.textContent = prefix + currentValue.toFixed(0);
            if (prefix === '$') {
                statElement.textContent = prefix + Number(currentValue.toFixed(0)).toLocaleString();
            }
        }, 1000 / steps);
    }
}

function initCharts() {
    // In a real app, we would use a charting library like Chart.js
    // For this demo, we'll just add a placeholder
    
    const canvas = document.getElementById('salesCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Simple bar chart
        const bars = [
            { month: 'Jan', value: 15 },
            { month: 'Feb', value: 20 },
            { month: 'Mar', value: 18 },
            { month: 'Apr', value: 25 },
            { month: 'May', value: 30 },
            { month: 'Jun', value: 35 }
        ];
        
        const max = Math.max(...bars.map(b => b.value));
        const barWidth = (canvas.width - 100) / bars.length - 20;
        const barGap = 20;
        
        bars.forEach((bar, index) => {
            const x = 60 + index * (barWidth + barGap);
            const barHeight = (bar.value / max) * (canvas.height - 60);
            const y = canvas.height - 40 - barHeight;
            
            // Bar
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Value
            ctx.fillStyle = '#555';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bar.value + 'k', x + barWidth/2, y - 10);
            
            // Month label
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bar.month, x + barWidth/2, canvas.height - 20);
        });
        
        // Y-axis labels
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        for (let i = 0; i <= max; i += 10) {
            const y = canvas.height - 40 - (i / max) * (canvas.height - 60);
            ctx.fillText(i + 'k', 50, y + 4);
        }
    }
}

function showAddProductModal() {
    // In a real app, this would show a modal
    // For this demo, we'll just add a new product
    const productsGrid = document.querySelector('.products-grid');
    const newProduct = document.createElement('div');
    newProduct.className = 'product-item';
    newProduct.innerHTML = `
        <div class="product-image" style="background-image: url('https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80');"></div>
        <div class="product-info">
            <h4>New Sweet</h4>
            <p class="product-category">New</p>
            <p class="product-price">$0.00</p>
        </div>
        <div class="product-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    productsGrid.appendChild(newProduct);
    alert('New product added! In a real app, this would open a form to enter product details.');
}

function editProduct(productItem) {
    const productName = productItem.querySelector('h4').textContent;
    const productPrice = productItem.querySelector('.product-price').textContent;
    alert(`Editing ${productName} (${productPrice}). In a real app, this would open an edit form.`);
}

function deleteProduct(productItem) {
    if (confirm('Are you sure you want to delete this product?')) {
        productItem.remove();
        alert('Product deleted!');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to home page
            window.location.href = data.redirect;
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Even if the API call fails, redirect to home
        window.location.href = '/';
    }
}