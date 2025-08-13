// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize 3D background
    init3DBackground();
});

function setupEventListeners() {
    // Form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Password validation
    const password = document.getElementById('register-password');
    const confirmPassword = document.getElementById('confirm-password');
    
    if (password) {
        password.addEventListener('input', validatePassword);
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }
}

function validatePassword() {
    const password = document.getElementById('register-password').value;
    const requirements = document.querySelector('.password-requirements ul');
    const items = requirements.querySelectorAll('li');
    
    // Reset styles
    items.forEach(item => {
        item.style.color = '#666';
        item.style.fontWeight = 'normal';
    });
    
    // Check requirements
    let validCount = 0;
    
    if (password.length >= 8) {
        document.getElementById('length').style.color = '#4CAF50';
        document.getElementById('length').style.fontWeight = 'bold';
        validCount++;
    }
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        document.getElementById('case').style.color = '#4CAF50';
        document.getElementById('case').style.fontWeight = 'bold';
        validCount++;
    }
    
    if (/[0-9]/.test(password)) {
        document.getElementById('number').style.color = '#4CAF50';
        document.getElementById('number').style.fontWeight = 'bold';
        validCount++;
    }
    
    return validCount === 3;
}

function validatePasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const matchDiv = document.getElementById('password-match');
    
    if (confirmPassword === '') {
        matchDiv.style.display = 'none';
        return true;
    }
    
    if (password === confirmPassword) {
        matchDiv.textContent = 'Passwords match';
        matchDiv.style.color = '#4CAF50';
        matchDiv.style.display = 'block';
        return true;
    } else {
        matchDiv.textContent = 'Passwords do not match';
        matchDiv.style.color = '#f44336';
        matchDiv.style.display = 'block';
        return false;
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const address = document.getElementById('address').value;
    const dob = document.getElementById('dob').value;
    const terms = document.getElementById('terms').checked;
    
    // Validate input
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !address || !dob) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!validatePassword()) {
        alert('Please meet all password requirements');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!terms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                password: password,
                address: address,
                dob: dob
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Redirect to verify email page
            window.location.href = data.redirect;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
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