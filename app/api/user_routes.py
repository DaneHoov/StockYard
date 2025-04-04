from flask import Blueprint, jsonify
from flask_login import login_required
from app.models import User

user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    all_users = User.query.all()
    return {'users': [user.to_dict() for user in all_users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    result = User.query.get(id)
    return result.to_dict()

# route to get all stocks


# route to get all stocks for a user
# route to get user's portfolio
# route to get user's accounts
# route to get user's watchlist
# route to get user's transactions
