from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import os
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Secure random key

# In-memory storage (in production, use a database)
users = [
    {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@email.com",
        "password": hashlib.sha256("password123".encode()).hexdigest(),
        "phone": "+1 555-123-4567",
        "address": "123 Saffron Street, Delhi, India",
        "dob": "1990-05-15",
        "role": "user",
        "verified": True
    }
]

admins = [
    {
        "id": 1,
        "username": "admin",
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "pin": hashlib.sha256("1234".encode()).hexdigest(),
        "last_login": "2023-06-15 10:30:00"
    }
]

products = [
    {
        "id": 1,
        "name": "Gulab Jamun",
        "description": "Soft dough balls soaked in rose-scented sugar syrup",
        "price": 12.99,
        "category": "classic",
        "image": "gulab-jamun.jpg",
        "in_stock": True
    },
    {
        "id": 2,
        "name": "Rasgulla",
        "description": "Light cheese balls in light sugar syrup",
        "price": 14.99,
        "category": "premium",
        "image": "rasgulla.jpg",
        "in_stock": True
    },
    {
        "id": 3,
        "name": "Jalebi",
        "description": "Crispy swirls soaked in saffron syrup",
        "price": 11.99,
        "category": "classic",
        "image": "jalebi.jpg",
        "in_stock": True
    },
    {
        "id": 4,
        "name": "Milk Barfi",
        "description": "Dense milk fudge with pistachio garnish",
        "price": 16.99,
        "category": "premium",
        "image": "barfi.jpg",
        "in_stock": True
    }
]

orders = [
    {
        "id": 1,
        "order_number": "ORD7821",
        "user_id": 1,
        "items": [
            {"product_id": 1, "name": "Gulab Jamun", "quantity": 1, "price": 12.99},
            {"product_id": 3, "name": "Jalebi", "quantity": 1, "price": 11.99}
        ],
        "total": 24.98,
        "status": "delivered",
        "date": "2023-06-15",
        "address": "123 Saffron Street, Delhi, India"
    }
]

# In-memory storage for OTPs and password reset tokens
otps = {}
password_reset_tokens = {}

# Email configuration (for demo purposes)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "email": "noreply.guptassweets@gmail.com",
    "password": "your-app-password"
}

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def generate_token():
    """Generate a secure token"""
    return secrets.token_urlsafe(32)

def send_email(to_email, subject, body):
    """
    Send email function
    In a real application, you would use a proper email service
    For this demo, we'll just print the email content
    """
    print(f"EMAIL TO: {to_email}")
    print(f"SUBJECT: {subject}")
    print(f"BODY: {body}")
    print("-" * 50)
    return True

@app.route('/')
def index():
    if 'user' in session:
        if session['user']['role'] == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('user'))
    return render_template('index.html')

@app.route('/login')
def login():
    if 'user' in session:
        if session['user']['role'] == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('user'))
    return render_template('login.html')

@app.route('/register')
def register():
    if 'user' in session:
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/forgot-password')
def forgot_password():
    if 'user' in session:
        return redirect(url_for('index'))
    return render_template('forgot-password.html')

@app.route('/reset-password/<token>')
def reset_password(token):
    if 'user' in session:
        return redirect(url_for('index'))
    
    # Check if token is valid
    for email, data in password_reset_tokens.items():
        if data['token'] == token:
            if datetime.now() < data['expires']:
                return render_template('reset-password.html', token=token)
            else:
                # Token expired
                del password_reset_tokens[email]
                break
    
    return "Invalid or expired reset link", 400

@app.route('/admin')
def admin():
    if 'user' in session and session['user']['role'] == 'admin':
        return render_template('admin.html')
    return redirect(url_for('login'))

@app.route('/user')
def user():
    if 'user' in session and session['user']['role'] == 'user':
        return render_template('user.html')
    return redirect(url_for('login'))

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    user_type = data.get('user_type')  # 'user' or 'admin'
    
    if user_type == 'user':
        email = data.get('email')
        password = hashlib.sha256(data.get('password').encode()).hexdigest()
        
        user = next((u for u in users if u['email'] == email and u['password'] == password), None)
        if user:
            if not user['verified']:
                return jsonify({"success": False, "message": "Please verify your email address before logging in"}), 401
                
            session['user'] = {
                'id': user['id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'role': user['role']
            }
            return jsonify({"success": True, "redirect": "/user", "message": "Login successful!"})
        else:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
    
    elif user_type == 'admin':
        username = data.get('username')
        password = hashlib.sha256(data.get('password').encode()).hexdigest()
        pin = hashlib.sha256(data.get('pin').encode()).hexdigest()
        
        admin = next((a for a in admins if a['username'] == username and a['password'] == password and a['pin'] == pin), None)
        if admin:
            session['user'] = {
                'id': admin['id'],
                'username': admin['username'],
                'role': 'admin'
            }
            # Update last login
            admin['last_login'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return jsonify({"success": True, "redirect": "/admin", "message": "Admin login successful!"})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    
    return jsonify({"success": False, "message": "Invalid request"}), 400

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    
    # Check if email already exists
    if any(u['email'] == data['email'] for u in users):
        return jsonify({"success": False, "message": "Email already registered"}), 400
    
    # Generate OTP
    otp = generate_otp()
    otps[data['email']] = {
        'otp': otp,
        'data': data,
        'created': datetime.now()
    }
    
    # Send OTP email
    subject = "Verify Your Email Address - Gupta's Sweets"
    body = f"""
    Hello {data['first_name']},

    Thank you for registering with Gupta's Sweets!
    
    To complete your registration, please enter the following verification code:
    
    {otp}
    
    This code will expire in 15 minutes.
    
    If you didn't request this, please ignore this email.
    
    Best regards,
    The Gupta's Sweets Team
    """
    
    try:
        send_email(data['email'], subject, body)
        return jsonify({"success": True, "message": "Registration successful! Please check your email for verification code.", "redirect": "/verify-email"})
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"success": False, "message": "Registration failed. Please try again."}), 500

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    # Check if OTP exists and is valid
    if email not in otps:
        return jsonify({"success": False, "message": "No verification request found for this email"}), 400
    
    otp_data = otps[email]
    
    # Check if OTP has expired (15 minutes)
    if datetime.now() > otp_data['created'] + timedelta(minutes=15):
        del otps[email]
        return jsonify({"success": False, "message": "Verification code has expired. Please register again."}), 400
    
    # Verify OTP
    if otp_data['otp'] == otp:
        # Create new user
        new_user = {
            "id": len(users) + 1,
            "first_name": otp_data['data']['first_name'],
            "last_name": otp_data['data']['last_name'],
            "email": email,
            "password": hashlib.sha256(otp_data['data']['password'].encode()).hexdigest(),
            "phone": otp_data['data']['phone'],
            "address": otp_data['data']['address'],
            "dob": otp_data['data']['dob'],
            "role": "user",
            "verified": True
        }
        
        users.append(new_user)
        # Remove OTP
        del otps[email]
        
        return jsonify({"success": True, "message": "Email verified successfully! You can now login.", "redirect": "/login"})
    else:
        return jsonify({"success": False, "message": "Invalid verification code"}), 400

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    data = request.json
    email = data.get('email')
    
    if email not in otps:
        return jsonify({"success": False, "message": "No pending verification for this email"}), 400
    
    # Generate new OTP
    new_otp = generate_otp()
    otps[email]['otp'] = new_otp
    otps[email]['created'] = datetime.now()
    
    # Send new OTP
    user_data = otps[email]['data']
    subject = "New Verification Code - Gupta's Sweets"
    body = f"""
    Hello {user_data['first_name']},

    Here is your new verification code:
    
    {new_otp}
    
    This code will expire in 15 minutes.
    
    Best regards,
    The Gupta's Sweets Team
    """
    
    try:
        send_email(email, subject, body)
        return jsonify({"success": True, "message": "New verification code sent to your email."})
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"success": False, "message": "Failed to send new code. Please try again."}), 500

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    data = request.json
    email = data.get('email')
    
    # Check if user exists
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        return jsonify({"success": False, "message": "If an account exists with this email, we've sent a password reset link."})
    
    # Generate reset token
    token = generate_token()
    expires = datetime.now() + timedelta(hours=1)
    
    password_reset_tokens[email] = {
        'token': token,
        'expires': expires
    }
    
    # Send reset email
    reset_link = f"http://127.0.0.1:5000/reset-password/{token}"
    subject = "Reset Your Password - Gupta's Sweets"
    body = f"""
    Hello {user['first_name']},

    We received a request to reset your password.
    
    Click the link below to create a new password:
    
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    Best regards,
    The Gupta's Sweets Team
    """
    
    try:
        send_email(email, subject, body)
        return jsonify({"success": True, "message": "If an account exists with this email, we've sent a password reset link."})
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"success": False, "message": "Failed to send reset email. Please try again."}), 500

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')
    
    # Find user by token
    target_email = None
    for email, token_data in password_reset_tokens.items():
        if token_data['token'] == token:
            if datetime.now() < token_data['expires']:
                target_email = email
            break
    
    if not target_email:
        return jsonify({"success": False, "message": "Invalid or expired reset link"}), 400
    
    # Update user password
    for user in users:
        if user['email'] == target_email:
            user['password'] = hashlib.sha256(new_password.encode()).hexdigest()
            break
    
    # Remove token
    del password_reset_tokens[target_email]
    
    return jsonify({"success": True, "message": "Password reset successful! You can now login with your new password.", "redirect": "/login"})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"success": True, "message": "Logged out successfully", "redirect": "/"})

@app.route('/api/products')
def get_products():
    return jsonify(products)

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/api/order', methods=['POST'])
def place_order():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    order_data = request.json
    user_id = session['user']['id']
    
    # Create order
    new_order = {
        "id": len(orders) + 1,
        "order_number": f"ORD{9000 + len(orders)}",
        "user_id": user_id,
        "items": order_data['items'],
        "total": order_data['total'],
        "status": "pending",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "address": order_data['address']
    }
    
    orders.append(new_order)
    
    response = {
        "success": True,
        "message": "Order placed successfully!",
        "order_id": new_order["order_number"],
        "total": new_order["total"]
    }
    return jsonify(response)

@app.route('/api/cart', methods=['GET'])
def get_cart():
    if 'user' not in session:
        return jsonify({"items": [], "count": 0, "total": 0})
    
    user_id = session['user']['id']
    if user_id not in carts:
        carts[user_id] = []
    
    cart_items = carts[user_id]
    total = sum(item['price'] * item['quantity'] for item in cart_items)
    
    return jsonify({
        "items": cart_items,
        "count": len(cart_items),
        "total": round(total, 2)
    })

@app.route('/api/cart', methods=['POST'])
def update_cart():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user']['id']
    if user_id not in carts:
        carts[user_id] = []
    
    data = request.json
    action = data.get('action')
    item = data.get('item')
    
    if action == 'add':
        # Check if item already in cart
        existing_item = next((i for i in carts[user_id] if i['id'] == item['id']), None)
        if existing_item:
            existing_item['quantity'] += 1
        else:
            carts[user_id].append({
                'id': item['id'],
                'name': item['name'],
                'price': item['price'],
                'quantity': 1
            })
    
    elif action == 'remove':
        carts[user_id] = [i for i in carts[user_id] if i['id'] != item['id']]
    
    elif action == 'update':
        for cart_item in carts[user_id]:
            if cart_item['id'] == item['id']:
                cart_item['quantity'] = item['quantity']
                if cart_item['quantity'] <= 0:
                    carts[user_id].remove(cart_item)
                break
    
    # Calculate new totals
    cart_items = carts[user_id]
    total = sum(item['price'] * item['quantity'] for item in cart_items)
    
    return jsonify({
        "items": cart_items,
        "count": len(cart_items),
        "total": round(total, 2)
    })

@app.route('/api/user/orders')
def user_orders():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user']['id']
    user_orders = [order for order in orders if order['user_id'] == user_id]
    
    return jsonify(user_orders)

@app.route('/api/user/profile')
def user_profile():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user']['id']
    user = next((u for u in users if u['id'] == user_id), None)
    
    if user:
        # Remove password from response
        safe_user = user.copy()
        safe_user.pop('password', None)
        return jsonify(safe_user)
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/user/profile', methods=['POST'])
def update_profile():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user']['id']
    data = request.json
    
    user = next((u for u in users if u['id'] == user_id), None)
    if user:
        user['first_name'] = data.get('first_name', user['first_name'])
        user['last_name'] = data.get('last_name', user['last_name'])
        user['phone'] = data.get('phone', user['phone'])
        user['address'] = data.get('address', user['address'])
        user['dob'] = data.get('dob', user['dob'])
        
        return jsonify({"success": True, "message": "Profile updated successfully!"})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/admin/orders')
def admin_orders():
    if 'user' not in session or session['user']['role'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify(orders)

@app.route('/api/admin/products', methods=['GET'])
def admin_get_products():
    if 'user' not in session or session['user']['role'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify(products)

@app.route('/api/admin/products', methods=['POST'])
def admin_add_product():
    if 'user' not in session or session['user']['role'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    new_product = {
        "id": len(products) + 1,
        "name": data['name'],
        "description": data['description'],
        "price": data['price'],
        "category": data['category'],
        "image": data.get('image', 'default.jpg'),
        "in_stock": data.get('in_stock', True)
    }
    
    products.append(new_product)
    return jsonify({"success": True, "message": "Product added successfully!", "product": new_product})

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def admin_update_product(product_id):
    if 'user' not in session or session['user']['role'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    product = next((p for p in products if p['id'] == product_id), None)
    
    if product:
        product['name'] = data.get('name', product['name'])
        product['description'] = data.get('description', product['description'])
        product['price'] = data.get('price', product['price'])
        product['category'] = data.get('category', product['category'])
        product['in_stock'] = data.get('in_stock', product['in_stock'])
        
        return jsonify({"success": True, "message": "Product updated successfully!", "product": product})
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def admin_delete_product(product_id):
    if 'user' not in session or session['user']['role'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    global products
    product = next((p for p in products if p['id'] == product_id), None)
    
    if product:
        products = [p for p in products if p['id'] != product_id]
        return jsonify({"success": True, "message": "Product deleted successfully!"})
    else:
        return jsonify({"error": "Product not found"}), 404

if __name__ == '__main__':
    # Create templates folder if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Copy HTML files to templates folder
    template_files = ['index.html', 'login.html', 'register.html', 'admin.html', 'user.html', 'forgot-password.html', 'reset-password.html', 'verify-email.html']
    for file in template_files:
        if os.path.exists(file):
            with open(file, 'r') as f:
                content = f.read()
            with open(f'templates/{file}', 'w') as f:
                f.write(content)
    
    # Create static folders
    if not os.path.exists('static'):
        os.makedirs('static')
    if not os.path.exists('static/css'):
        os.makedirs('static/css')
    if not os.path.exists('static/js'):
        os.makedirs('static/js')
    
    # Copy CSS files
    css_files = ['style.css', 'auth.css', 'admin.css', 'user.css']
    for file in css_files:
        if os.path.exists(file):
            with open(file, 'r') as f:
                content = f.read()
            with open(f'static/css/{file}', 'w') as f:
                f.write(content)
    
    # Copy JS files
    js_files = ['script.js', 'auth.js', 'admin.js', 'user.js']
    for file in js_files:
        if os.path.exists(file):
            with open(file, 'r') as f:
                content = f.read()
            with open(f'static/js/{file}', 'w') as f:
                f.write(content)
    
    # Run the Flask app
    app.run(debug=True, port=5000)