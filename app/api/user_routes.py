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
def user(user_id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    result = User.query.get(user_id)
    return result.to_dict()

# Portfolio
#   Users should be able to view their portfolio.
#   Users should be able to create a new portfolio.
#   Users should be able to update their portfolio (add fake money).
#   Users should be able to delete their portfolio (selling stocks).
# Stock Details
#   Users should be able to view details of selected stocks.
#   Users should be able to purchase stocks and add them to their portfolio.
#   Users should be able to update the amount of stocks they want to purchase.
#   Users should be able to delete stocks from their order.
# Watchlist
#   Users should be able to view all of their watched stocks.
#   Users should be able to add a stock to their watchlist.
#   Users should be able to remove a stock from their watchlist.
# Search
#   Users should be able to search for a stock by name.
#   Users should be able to view the results of their search.
# Bonus: Transactions
#   Users should be able to view their transaction history.
#   Users should be able to "order" stocks at a certain time/frequency.
#   Users should be able to cancel transactions.
