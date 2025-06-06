from flask import Blueprint, request
from flask_login import current_user, login_user, logout_user
from app.models import User, db, Portfolio
from app.forms import LoginForm
from app.forms import SignUpForm

auth_routes = Blueprint('auth', __name__)


@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        user = current_user.to_dict()
        portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
        user['portfolio_id'] = portfolio.id if portfolio else None
        return user
    return {'errors': {'message': 'Unauthorized'}}, 401


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    # Get the csrf_token from the request cookie and put it into the
    # form manually to validate_on_submit can be used
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        # Add the user to the session, we are logged in!
        identifier = form.data['email']  # This can be an email or phone number
        password = form.data['password']

        # Check if the identifier is a phone number (starts with '+' and is numeric)
        if identifier.startswith('+') and identifier[1:].isdigit():
            user = User.query.filter(User.phone == identifier).first()
            print(f"Queried user by phone: {user}")
        else:
            user = User.query.filter(User.email == identifier).first()
            print(f"Queried user by email: {user}")

        if user and user.check_password(password):
            login_user(user)
            print(f"User logged in: {user}")
            return user.to_dict()

    print("Form errors:", form.errors)
    return form.errors, 401


@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    data = request.get_json()
    phone = data.get('phone')
    verification_code = data.get('verification_code')

    # Simulate a verification code for demo purposes
    expected_code = "123456"  # Hardcoded for demo

    if verification_code != expected_code:
        return {"error": "Invalid verification code."}, 400

    # Check if the phone number (email) is already in use
    if User.query.filter(User.username == phone).first():
        return {"error": "Phone number is already in use."}, 400

    # Create the user
    user = User(username=phone, email=f"{phone}@demo.com", phone=phone, password="defaultpassword123")
    db.session.add(user)
    db.session.commit()

    # Create a portfolio for the new user
    portfolio = Portfolio(user_id=user.id, balance=10000.0)
    db.session.add(portfolio)
    db.session.commit()

    login_user(user)

    user_data = user.to_dict()
    user_data['portfolio'] = portfolio.to_dict_basic()

    return user.to_dict()

@auth_routes.route('/send-code', methods=['POST'])
def send_verification_code():
    """
    Simulates sending a verification code to the user's phone number
    """
    data = request.get_json()
    phone = data.get('phone')

    if not phone:
        return {"error": "Phone number is required."}, 400

    # Simulate sending a verification code
    verification_code = "123456"  # Hardcoded for demo
    print(f"Verification code for {phone}: {verification_code}")

    return {"message": "Verification code sent successfully."}, 200


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {'errors': {'message': 'Unauthorized'}}, 401
