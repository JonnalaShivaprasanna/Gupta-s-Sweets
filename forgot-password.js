// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize 3D background
    init3DBackground();
});

function setupEventListeners() {
    // Form submission
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    // Validate input
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        const data = await response.json();
        
        alert(data.message);
        
        // Always redirect to login to prevent email enumeration
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    } catch (error) {
        console.error('Forgot password error:', error);
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