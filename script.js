// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Loading screen
    const loadingScreen = document.getElementById('loading-screen');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
        }, 500);
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update active nav item
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Product filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCardsAll = document.querySelectorAll('.product-card'); // Renamed from productCards
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            
            // Filter products
            productCardsAll.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Cart functionality
    let cartCount = 0;
    let cartTotal = 0;
    const cartBadge = document.querySelector('.badge');
    const totalPrice = document.getElementById('total-price');
    const selectedItems = document.getElementById('selected-items');
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            
            // Add to cart count
            cartCount++;
            cartBadge.textContent = cartCount;
            
            // Add to total
            cartTotal += productPrice;
            totalPrice.textContent = `$${cartTotal.toFixed(2)}`;
            
            // Add to selected items
            const itemElement = document.createElement('div');
            itemElement.className = 'selected-item';
            itemElement.innerHTML = `
                <div>${productName}</div>
                <div>$${productPrice.toFixed(2)}</div>
            `;
            selectedItems.appendChild(itemElement);
            
            // Animation feedback
            this.textContent = 'Added!';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = 'Add to Box';
                this.style.backgroundColor = '#8B0000';
            }, 1000);
        });
    });

    // 3D Product Display with Three.js
    function create3DProduct(containerId, color, shape) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFFF8E7, 0);
        container.appendChild(renderer.domElement);
        
        // Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create object based on shape
        let geometry, material, object;
        
        switch(shape) {
            case 'sphere': // Gulab Jamun
                geometry = new THREE.SphereGeometry(1, 32, 32);
                material = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0x333333,
                    shininess: 50
                });
                object = new THREE.Mesh(geometry, material);
                break;
                
            case 'torus': // Jalebi
                geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 50);
                material = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0x555555,
                    shininess: 80
                });
                object = new THREE.Mesh(geometry, material);
                // Rotate torus to lay flat
                object.rotation.x = Math.PI / 2;
                break;
                
            case 'cylinder': // Rasgulla
                geometry = new THREE.CylinderGeometry(1, 1, 0.6, 32);
                material = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0x444444,
                    shininess: 40
                });
                object = new THREE.Mesh(geometry, material);
                break;
                
            case 'box': // Barfi
                geometry = new THREE.BoxGeometry(1.5, 0.3, 1.5);
                material = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0x333333,
                    shininess: 30
                });
                object = new THREE.Mesh(geometry, material);
                break;
                
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
                material = new THREE.MeshPhongMaterial({ color: color });
                object = new THREE.Mesh(geometry, material);
        }
        
        scene.add(object);
        
        // Position camera
        camera.position.z = 4;
        
        // Add orbit controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.enableZoom = false;
        controls.enablePan = false;
        
        // Auto-rotation when not being controlled
        let autoRotate = true;
        controls.addEventListener('start', () => {
            autoRotate = false;
        });
        
        controls.addEventListener('end', () => {
            setTimeout(() => {
                autoRotate = true;
            }, 3000);
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            if (autoRotate) {
                object.rotation.y += 0.005;
            }
            
            controls.update();
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    }

    // Create 3D models for each product
    setTimeout(() => {
        create3DProduct('gulab-jamun', 0xD2691E, 'sphere'); // Brown for gulab jamun
        create3DProduct('rasgulla', 0xF5F5DC, 'cylinder'); // Beige for rasgulla
        create3DProduct('jalebi', 0xFFA500, 'torus'); // Orange for jalebi
        create3DProduct('barfi', 0xF8F8FF, 'box'); // White for barfi
    }, 1000);

    // Hero 3D scene
    function createHeroScene() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        scene.add(mainLight);
        
        const accentLight = new THREE.PointLight(0xFFD700, 0.5, 10);
        accentLight.position.set(-3, 2, 3);
        scene.add(accentLight);
        
        // Create multiple sweets
        const sweets = [
            { shape: 'sphere', color: 0xD2691E, position: [-2, 0, 0], rotation: [0, 0, 0], size: 1.5 },
            { shape: 'torus', color: 0xFFA500, position: [2, 0.5, -1], rotation: [Math.PI/2, 0, 0], size: 1 },
            { shape: 'cylinder', color: 0xF5F5DC, position: [0, -0.5, 2], rotation: [0, 0, 0], size: 1.2 },
            { shape: 'box', color: 0xF8F8FF, position: [-1.5, 0.2, -2], rotation: [0, 0, 0], size: 1.3 }
        ];
        
        const objects = [];
        
        sweets.forEach(sweet => {
            let geometry, material, object;
            
            switch(sweet.shape) {
                case 'sphere':
                    geometry = new THREE.SphereGeometry(sweet.size, 32, 32);
                    break;
                case 'torus':
                    geometry = new THREE.TorusGeometry(sweet.size * 0.8, sweet.size * 0.3, 16, 50);
                    break;
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(sweet.size, sweet.size, sweet.size * 0.6, 32);
                    break;
                case 'box':
                    geometry = new THREE.BoxGeometry(sweet.size, sweet.size * 0.3, sweet.size);
                    break;
            }
            
            material = new THREE.MeshPhongMaterial({ 
                color: sweet.color,
                specular: 0x333333,
                shininess: 50
            });
            
            object = new THREE.Mesh(geometry, material);
            object.position.set(sweet.position[0], sweet.position[1], sweet.position[2]);
            object.rotation.set(sweet.rotation[0], sweet.rotation[1], sweet.rotation[2]);
            
            // Add subtle random rotation
            object.userData = {
                rotSpeed: {
                    x: Math.random() * 0.01 - 0.005,
                    y: Math.random() * 0.01 - 0.005,
                    z: Math.random() * 0.01 - 0.005
                }
            };
            
            scene.add(object);
            objects.push(object);
        });
        
        // Position camera
        camera.position.z = 10;
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate all objects
            objects.forEach(object => {
                object.rotation.x += object.userData.rotSpeed.x;
                object.rotation.y += object.userData.rotSpeed.y;
                object.rotation.z += object.userData.rotSpeed.z;
            });
            
            // Subtle camera movement
            camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
            camera.position.y = Math.cos(Date.now() * 0.0005) * 0.3;
            
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
    
    // Initialize hero scene
    createHeroScene();
    
    // Custom box 3D scene
    function createCustomBoxScene() {
        const container = document.getElementById('custom-box');
        if (!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFFFFFF, 0);
        container.appendChild(renderer.domElement);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create box
        const boxGeometry = new THREE.BoxGeometry(2, 0.5, 2);
        const boxMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,
            specular: 0x555555,
            shininess: 30
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(box);
        
        // Decorative ribbon
        const ribbonGeometry = new THREE.BoxGeometry(0.1, 0.6, 2.1);
        const ribbonMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        scene.add(ribbon);
        
        const ribbon2Geometry = new THREE.BoxGeometry(2.1, 0.6, 0.1);
        const ribbon2 = new THREE.Mesh(ribbon2Geometry, ribbonMaterial);
        scene.add(ribbon2);
        
        // Position camera
        camera.position.z = 5;
        
        // Add orbit controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            box.rotation.y += 0.005;
            ribbon.rotation.y += 0.005;
            ribbon2.rotation.y += 0.005;
            controls.update();
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    }
    
    // Initialize custom box scene
    setTimeout(createCustomBoxScene, 1500);
    
    // Drag and drop for custom box (simplified)
    const productCardsDrag = document.querySelectorAll('.product-card'); // Renamed from productCards
    const boxPreview = document.querySelector('.box-preview');
    
    productCardsDrag.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.querySelector('h3').textContent);
            card.style.opacity = '0.4';
        });
        
        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
        });
    });
    
    boxPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    boxPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        const productName = e.dataTransfer.getData('text/plain');
        const itemElement = document.createElement('div');
        itemElement.textContent = productName;
        itemElement.style.margin = '0.5rem 0';
        itemElement.style.padding = '0.5rem';
        itemElement.style.background = 'rgba(255, 255, 255, 0.1)';
        itemElement.style.borderRadius = '5px';
        document.getElementById('selected-items').appendChild(itemElement);
    });
});