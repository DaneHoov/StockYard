from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, WatchlistStock, Portfolio, PortfolioStock, Stock

stock_routes = Blueprint('stocks', __name__)

@stock_routes.route('/')
def get_stocks():
    stocks = [
        {"id": 1, "ticker": "AAPL", "price": 175.64, "change": "+1.35%"},
        {"id": 2, "ticker": "GOOG", "price": 135.12, "change": "-0.90%"},
        {"id": 3, "ticker": "MSFT", "price": 320.45, "change": "+0.98%"},
        {"id": 4, "ticker": "AMZN", "price": 135.67, "change": "+1.08%"},
        {"id": 5, "ticker": "NVDA", "price": 450.23, "change": "+1.28%"},
        {"id": 6, "ticker": "TSLA", "price": 245.12, "change": "-1.39%"},
        {"id": 7, "ticker": "PLTR", "price": 17.45, "change": "+4.00%"},
    ]
    return jsonify(stocks)

@stock_routes.route('/<string:ticker>', methods=['GET'])
def get_stock_details(ticker):
    stock = Stock.query.filter_by(ticker=ticker.upper()).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    return jsonify(stock.to_dict())


@stock_routes.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify({'error': 'Search query is required'}), 400

    results = Stock.query.filter(
        db.or_(
            Stock.name.ilike(f'%{query}%'),
            Stock.ticker.ilike(f'%{query}%')
        )
    ).all()

    return jsonify([{
        'id': stock.id,
        'ticker': stock.ticker,
        'name': stock.name,
        'price': stock.price
    } for stock in results]), 200


@stock_routes.route('/watchlist', methods=['POST'])
@login_required
def add_to_watchlist():
    data = request.json
    print("Request payload:", data)  # Debugging log
    stock_id = data.get('stock_id')
    watchlist_id = data.get('watchlist_id')
    if not stock_id or not watchlist_id:
        return {"error": "Stock ID and Watchlist ID are required"}, 400

    existing = WatchlistStock.query.filter_by(watchlist_id=watchlist_id, stock_id=stock_id).first()
    if existing:
        print("Stock already in watchlist:", existing)  # Debugging log
        return {"message": "Stock already in watchlist"}, 200

    new_watchlist_stock = WatchlistStock(watchlist_id=watchlist_id, stock_id=stock_id)
    db.session.add(new_watchlist_stock)
    db.session.commit()
    print("Stock added to watchlist:", new_watchlist_stock)  # Debugging log
    return {"message": "Stock added to watchlist"}, 201

@stock_routes.route('/watchlist/<int:stock_id>', methods=['DELETE'])
@login_required
def remove_from_watchlist(stock_id):
    print(f"Attempting to remove stock ID {stock_id} for user {current_user.id}")  # Debug log

    # Find the matching WatchlistStock entry using watchlist_id
    watch_item = WatchlistStock.query.filter_by(watchlist_id=current_user.id, stock_id=stock_id).first()

    if not watch_item:
        print("Stock not found in watchlist")  # Debug log
        return jsonify({'error': 'Stock not found in watchlist'}), 404

    db.session.delete(watch_item)
    db.session.commit()
    print(f"Removed stock ID {stock_id} from watchlist")  # Debug log
    return jsonify({'message': 'Stock removed from watchlist'}), 200


@stock_routes.route('/portfolio', methods=['POST'])
@login_required
def add_to_portfolio():
    data = request.json
    print("📦 Received JSON data:", data)  # Debugging log

    stock_id = data.get('stock_id')
    quantity = data.get('quantity', 1)  # Default quantity to 1 if not provided

    if not stock_id:
        print("❌ Missing stock_id in request")  # Debugging log
        return {"error": "Stock ID is required"}, 400

    # Ensure the stock exists
    stock = Stock.query.get(stock_id)
    if not stock:
        print("❌ Stock not found:", stock_id)  # Debugging log
        return {"error": "Stock not found"}, 404

    # Ensure the user has a portfolio
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).first()
    if not portfolio:
        print("❌ Portfolio not found for user:", current_user.id)  # Debugging log
        return {"error": "Portfolio not found"}, 404

    # Add or update the stock in the portfolio
    portfolio_stock = PortfolioStock.query.filter_by(portfolio_id=portfolio.id, stock_id=stock.id).first()
    if portfolio_stock:
        portfolio_stock.quantity += quantity
        print(f"✅ Updated stock ID {stock_id} in portfolio ID {portfolio.id} with quantity {portfolio_stock.quantity}")  # Debugging log
    else:
        portfolio_stock = PortfolioStock(portfolio_id=portfolio.id, stock_id=stock.id, quantity=quantity)
        db.session.add(portfolio_stock)
        print(f"✅ Added stock ID {stock_id} to portfolio ID {portfolio.id} with quantity {quantity}")  # Debugging log

    db.session.commit()
    return {"message": "Stock added to portfolio"}


@stock_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['PUT'])
def update_stock_quantity(portfolio_id, stock_id):
    data = request.get_json()
    new_quantity = data.get('quantity')

    holding = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404

    holding.quantity = new_quantity
    db.session.commit()
    return jsonify({'message': 'Stock quantity updated'})

@stock_routes.route('/portfolio/<int:portfolio_id>/stocks/<int:stock_id>', methods=['DELETE'])
def delete_stock_from_portfolio(portfolio_id, stock_id):
    holding = PortfolioStock.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404

    # Optionally refund user based on current price
    stock = Stock.query.get(stock_id)
    portfolio = Portfolio.query.get(portfolio_id)
    refund = stock.price * holding.quantity
    portfolio.balance += refund

    db.session.delete(holding)
    db.session.commit()
    return jsonify({'message': 'Stock removed from portfolio and refunded'})

@stock_routes.route('/portfolio/<string:ticker>', methods=['DELETE'])
@login_required
def remove_from_portfolio(ticker):
    portfolio_id = request.args.get('portfolio_id')  # Ensure you pass the portfolio ID
    if not portfolio_id:
        return {"error": "Portfolio ID is required"}, 400

    # Query the PortfolioStock model to find the stock in the portfolio
    portfolio_stock = PortfolioStock.query.join(Stock).filter(
        PortfolioStock.portfolio_id == portfolio_id,
        Stock.ticker == ticker
    ).first()

    if portfolio_stock:
        db.session.delete(portfolio_stock)
        db.session.commit()
        return {"message": "Stock removed from portfolio"}, 200
    else:
        return {"error": "Stock not found in portfolio"}, 404
