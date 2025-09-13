import os
import secrets
from datetime import timedelta
from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from flask_mail import Mail
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from backend.service.cust_service import CustomerService
from backend.utils.exceptions import ServiceException
# Load environment variables
load_dotenv()
# ------------------ Flask App ------------------
app = Flask(__name__, static_folder='frontend/Online_Grocery_Store/dist', static_url_path='')
app.secret_key = os.getenv("SECRET_KEY", secrets.token_hex(16))
# ------------------ Mail ------------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")  # Your email here
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
mail = Mail(app)
# ------------------ CORS ------------------
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
# ------------------ Service ------------------
service = CustomerService(mail)
# ------------------ Session ------------------
app.config.update(
    SESSION_COOKIE_NAME="session",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",  # safer default, works with localhost
    SESSION_COOKIE_SECURE=False,    # must stay False for localhost http
    PERMANENT_SESSION_LIFETIME=timedelta(hours=2)
)
# ------------------ OAuth ------------------
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id= os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
    PERMANENT_SESSION_LIFETIME=timedelta(hours=2),
)
# ------------------ Frontend Serving (MPA) ------------------
@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        # Optional fallback to index.html for unknown paths
        return send_from_directory(app.static_folder, "index.html")
# ------------------ Routes ------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    try:
        result = service.send_verification_email(data)
        return jsonify(result), 200
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400
@app.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.json
    try:
        customer_id = service.verify_code(
            data['email'],
            data['otp'],
        )
        # Save to session
        service.login(data['email'], data.get('password'))
        session['customer_id'] = customer_id
        session['email'] = data['email']
        session['name'] = data['name']   # ✅ store name in session
        session.permanent = True
        return jsonify({
            "success": True,
            "message": "Registration successful.",
            "user": {
                "customer_id": customer_id,
                "name": data['name'],
                "email": data['email']
            }
        }), 201
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400
@app.route('/login/google')
def login_google():
    next_url = request.args.get("next", "/")
    session["next"] = next_url
    redirect_uri = url_for("google_callback", _external=True)
    print("👉 Redirect URI being sent to Google:", redirect_uri)  # Debug
    return google.authorize_redirect(redirect_uri)

@app.route('/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        resp = google.get("https://openidconnect.googleapis.com/v1/userinfo", token=token)
        user_info = resp.json()

        email = user_info.get("email")
        name = user_info.get("name")
        google_id = user_info.get("sub")
        picture_url = user_info.get("picture")

        if not email or not google_id:
            return jsonify({"success": False, "error": "Google login failed"}), 400
        customer_id = service.login_with_google(email, name, google_id, picture_url)
        session['customer_id'] = customer_id
        session['email'] = email
        session['name'] = name
        session.permanent = True
        next_url = session.pop("next", "/")

        frontend_origin = "http://localhost:5173"
        return f"""
        <script>
            window.opener.postMessage({{
                success: true,
                user: {{
                    customer_id: "{customer_id}",
                    name: "{name}",
                    email: "{email}",
                    picture_url: "{picture_url}",
                }},
                next_url: "{next_url}"
            }}, "{frontend_origin}");
            setTimeout(() => window.close(), 1000);
        </script>
        """
    except Exception as e:
        frontend_origin = "http://localhost:5173"
        return f"""
        <script>
            window.opener.postMessage({{
                success: false,
                error: "{str(e)}"
            }}, "{frontend_origin}");
            window.close();
        </script>
        """
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    try:
        customer_id, name = service.login(data['email'], data['password'])
        session['customer_id'] = customer_id
        session['email'] = data['email']
        session['name'] = name
        session.permanent = True
        return jsonify({
            "message": "Login successful.",
            "customer_id": customer_id
        }), 200
    except ServiceException as e:
        return jsonify({"error": str(e)}), 401

@app.route('/auth/status', methods=['GET'])
def auth_status():
    """Check if user is logged in"""
    if 'customer_id' in session:
        print(session)
        return jsonify({
            "authenticated": True,
            "user": {
                "customer_id": session['customer_id'],
                "email": session.get('email'),
                "name": session.get('name')
            }
        })
    return jsonify({"authenticated": False}), 200


@app.route('/me', methods=['GET'])
def me():
    """Return current logged in user details"""
    if 'customer_id' not in session:
        return jsonify({"error": "User not logged in"}), 401
    return jsonify({
        "customer_id": session['customer_id'],
        "email": session.get('email')
    })
@app.route('/restore', methods=['POST'])
def restore_account():
    data = request.json
    try:
        result = service.restore_customer(data['email'])
        return jsonify({"message": result["message"]})
    except ServiceException as e:
        return jsonify({"error": str(e)}), 404

@app.route('/products/<int:customer_id>/<string:product_name>/', methods=['GET'])
def get_product_by_customer_and_name(customer_id, product_name):
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        product = service.get_product_details_by_name(product_name)
        return jsonify(product), 200
    except ServiceException as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/<int:customer_id>', methods=['GET'])
@app.route('/products/<int:customer_id>/', methods=['GET'])
def product_catalog(customer_id):
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        products = service.get_product_catalog()
        product_list = [product.to_dict() for product in products["data"]]
        return jsonify(product_list)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/cart/<int:customer_id>/add', methods=['POST'])
def add_to_cart(customer_id):
    data = request.json
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.add_to_cart(customer_id, data['product_name'], data['quantity'])
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/cart/<int:customer_id>/update', methods=['PUT'])
def update_cart(customer_id):
    data = request.json
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.update_cart(customer_id, data['product_name'], data['quantity'])
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/cart/<int:customer_id>/delete', methods=['DELETE'])
def delete_cart_item(customer_id):
    data = request.json
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.delete_cart_item(customer_id, data['product_name'])
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/orders/<int:customer_id>/', methods=['POST'])
def place_order(customer_id):
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.place_order(customer_id)
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/orders/<int:customer_id>/history', methods=['GET'])
def view_order_history(customer_id):
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.view_order_history(customer_id)
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 404
@app.route('/customer/<int:customer_id>/details', methods=['GET'])
def get_customer_details(customer_id):
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    try:
        result = service.get_customer_details(customer_id)
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 404

@app.route('/customer/<int:customer_id>/update', methods=['PUT'])
def update_customer_details():
    data = request.json
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    customer_id = session['customer_id']
    try:
        result = service.update_customer_details(
            customer_id=customer_id,
            name=data.get('name'),
            email=data.get('email'),
            password=data.get('password'),
            address=data.get('address'),
            contact_number=data.get('contact')
        )
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/customer/<int:customer_id>/delete', methods=['DELETE'])
def soft_delete_customer():
    if 'customer_id' not in session:
        return jsonify({"error": "User is not logged in"}), 401
    customer_id = session['customer_id']
    try:
        result = service.soft_delete_customer(customer_id)
        session.pop('customer_id', None)
        session.pop('email', None)
        return jsonify(result)
    except ServiceException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/logout/<int:customer_id>', methods=['POST'])
def logout(customer_id):
    try:
        service.logout(customer_id)
        session.pop('customer_id', None)
        session.pop('email', None)
        session.pop('name', None)
        return jsonify({"message": "Logged out successfully!"})
    except ServiceException as e:
        return jsonify({"error": str(e)}), 500
# ------------------ Run ------------------
if __name__ == '__main__':
    app.run(debug=True)