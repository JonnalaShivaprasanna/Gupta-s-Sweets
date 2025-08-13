// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize 3D background
    init3DBackground();
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = document.getElementById('reset-token').value;
    
    if (!token) {
        alert('Invalid reset link');
        window.location.href = '/forgot-password';
    }
});

function setupEventListeners() {
    // Form submission
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Password validation
    const newPassword = document.getElementById('new-password');
    const confirmPassword = document.getElementById('confirm-password');
    
    if (newPassword) {
        newPassword.addEventListener('input', validatePassword);
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }
}

function validatePassword() {
    const password = document.getElementById('new-password').value;
    const requirements = document.querySelector('.password-requirements ul');
    
    // Reset styles
    const items = requirements.querySelectorAll('li');
    items.forEach(item => {
        item.style.color = '#666';
        item.style.fontWeight = 'normal';
    });
    
    // Check requirements
    let validCount = 0;
    
    if (password.length >= 8) {
        items[0].style.color = '#4CAF50';
        items[0].style.fontWeight = 'bold';
        validCount++;
    }
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        items[1].style.color = '#4CAF50';
        items[1].style.fontWeight = 'bold';
        validCount++;
    }
    
    if (/[0-9]/.test(password)) {
        items[2].style.color = '#4CAF50';
        items[2].style.fontWeight = 'bold';
        validCount++;
    }
    
    return validCount === 3;
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const confirmPasswordField = document.getElementById('confirm-password');
    
    if (confirmPassword === '') {
        confirmPasswordField.style.borderColor = '#ddd';
        return true;
    }
    
    if (newPassword === confirmPassword) {
        confirmPasswordField.style.borderColor = '#4CAF50';
        return true;
    } else {
        confirmPasswordField.style.borderColor = '#f44336';
        return false;
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate input
    if (!newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
        alert('Password must contain both uppercase and lowercase letters');
        return;
    }
    
    if (!/[0-9]/.test(newPassword)) {
        alert('Password must contain at least one number');
        return;
    }
    
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Redirect to login page
            window.location.href = data.redirect;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Reset password error:', error);
        alert('An error occurred. Please try again.');
    }
}

function init3DBackground() {
    const container = document.getElementById('login-background');
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);
    
    // Create floating sweets
    const sweets = [];
    const sweetTypes = [
        { shape: 'sphere', color: 0xD2691E, size: 0.8 },  // Gulab Jamun
        { shape: 'torus', color: 0xFFA500, size: 0.6 },   // Jalebi
        { shape: 'cylinder', color: 0xF5F5DC, size: 0.7 }, // Rasgulla
        { shape: 'box', color: 0xF8F8FF, size: 0.9 }       // Barfi
    ];
    
    // Create multiple sweets
    for (let i = 0; i < 15; i++) {
        const type = sweetTypes[Math.floor(Math.random() * sweetTypes.length)];
        let geometry, material, object;
        
        switch(type.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(type.size, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(type.size * 0.6, type.size * 0.2, 16, 50);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(type.size, type.size, type.size * 0.4, 32);
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(type.size, type.size * 0.2, type.size);
                break;
        }
        
        material = new THREE.MeshPhongMaterial({ 
            color: type.color,
            specular: 0x333333,
            shininess: 50
        });
        
        object = new THREE.Mesh(geometry, material);
        
        // Random position
        object.position.set(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5
        );
        
        // Random rotation
        object.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Store movement properties
        object.userData = {
            speed: Math.random() * 0.02 + 0.01,
            angleX: Math.random() * Math.PI * 2,
            angleY: Math.random() * Math.PI * 2,
            offsetX: Math.random() * 2,
            offsetY: Math.random() * 2,
            rotationSpeed: Math.random() * 0.01 + 0.005
        };
        
        scene.add(object);
        sweets.push(object);
    }
    
    // Position camera
    camera.position.z = 15;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        // Move sweets in gentle patterns
        sweets.forEach(sweet => {
            sweet.userData.angleX += sweet.userData.speed;
            sweet.userData.angleY += sweet.userData.speed;
            
            sweet.position.x = Math.sin(sweet.userData.angleX) * sweet.userData.offsetX;
            sweet.position.y = Math.sin(sweet.userData.angleY) * sweet.userData.offsetY;
            
            sweet.rotation.x += sweet.userData.rotationSpeed;
            sweet.rotation.y += sweet.userData.rotationSpeed;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}