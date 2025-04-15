from flask import Blueprint, jsonify, request
from app.models import db, Stock, Watchlist, Portfolio

stock_routes = Blueprint('stocks', __name__)

@stock_routes.route('/')
def get_stocks():
    # Fetch real-time stock data (mocked for now)
    stocks = [
        {"symbol": "AAPL", "price": 175.64, "change": "+1.35%"},
        {"symbol": "GOOG", "price": 135.12, "change": "-0.90%"},
        # Add more stocks here
    ]
    return jsonify(stocks)

@stock_routes.route('/watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.json

    return {"message": "Stock added to watchlist"}

@stock_routes.route('/portfolio', methods=['POST'])
def add_to_portfolio():
    data = request.json
    # Add stock to portfolio logic
    return {"message": "Stock added to portfolio"}
