// DOM elements
let currentSection = 'dashboard';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Load user data
    loadUserData();
    
    // Show dashboard by default
    showSection('dashboard');
});

function setupEventListeners() {
    // Sidebar navigation
    const navLinks = document.querySelectorAll('.user-sidebar nav ul li a');
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
    
    // Profile form submission
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Order filter buttons
    const filterButtons = document.querySelectorAll('.orders-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // In a real app, we would filter the orders
            // For this demo, we'll just show a message
            const filter = this.textContent;
            console.log(`Filtering orders by: ${filter}`);
        });
    });
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            
            // Add to cart (would call API in real app)
            updateCart({
                id: Date.now(), // In real app, this would be the product ID
                name: productName,
                price: productPrice,
                quantity: 1
            }, 'add');
            
            // Visual feedback
            this.textContent = 'Added!';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.backgroundColor = '#8B0000';
            }, 1500);
        });
    });
    
    // Reorder buttons
    const reorderButtons = document.querySelectorAll('.order-actions .btn-secondary:nth-child(2)');
    reorderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderItem = this.closest('.order-item');
            const orderId = orderItem.querySelector('.order-id').textContent;
            alert(`Reordering ${orderId}. In a real app, this would add the items to your cart.`);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.user-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    currentSection = sectionId;
}

async function loadUserData() {
    try {
        // In a real app, we would fetch user data from the API
        // For this demo, we'll use the data already in the page
        
        // Update stats with animated counters
        animateCounter('Total Orders', 12, '');
        animateCounter('Rewards Points', 245, '');
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function animateCounter(title, targetValue, prefix = '') {
    const statElement = document.querySelector(`.stat-info h3:-soup-contains("${title}") ~ .stat-value`);
    
    if (statElement) {
        let currentValue = 0;
        const duration = 1000; // ms
        const steps = 60;
        const increment = targetValue / (duration / (1000 / steps));
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            statElement.textContent = prefix + Math.floor(currentValue);
        }, 1000 / steps);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = {
        first_name: document.querySelector('input[placeholder="First Name"]').value,
        last_name: document.querySelector('input[placeholder="Last Name"]').value,
        phone: document.querySelector('input[placeholder="Phone"]').value,
        address: document.querySelector('textarea').value,
        dob: document.querySelector('input[type="date"]').value
    };
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
        } else {
            alert('Error updating profile');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function updateCart(item, action) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                item: item
            })
        });
        
        const data = await response.json();
        
        // Update cart badge in header
        const cartBadge = document.querySelector('.cart-icon .badge');
        if (cartBadge) {
            cartBadge.textContent = data.count;
        }
        
        // Update cart total in header (would need to implement)
        
    } catch (error) {
        console.error('Cart update error:', error);
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