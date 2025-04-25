from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, WatchlistStock, Watchlist, Stock

watchlist_routes = Blueprint('watchlist', __name__)

@watchlist_routes.route('/<int:watchlist_id>', methods=['GET'])
@login_required
def get_watchlist(watchlist_id):
    watchlist = Watchlist.query.filter_by(id=watchlist_id, user_id=current_user.id, deleted=False).first()
    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404
    return jsonify(watchlist.to_dict())
    # return jsonify([{
    #     'id': item.stock.id,
    #     'ticker': item.stock.ticker,
    #     'price': item.stock.price,
    #     'change': item.stock.change,
    # } for item in watchlist])

@watchlist_routes.route('/create', methods=['POST'])
@login_required
def create_watchlist():
    if not current_user.is_authenticated:
        return jsonify({'error': 'User is not authenticated'}), 401

    data = request.json
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Watchlist name is required'}), 400

    # Check for duplicate watchlist name
    existing_watchlist = Watchlist.query.filter_by(user_id=current_user.id, name=name, deleted=False).first()
    if existing_watchlist:
        return jsonify({'error': 'A watchlist with this name already exists'}), 400

    new_watchlist = Watchlist(user_id=current_user.id, name=name)
    db.session.add(new_watchlist)
    db.session.commit()
    return new_watchlist.to_dict(), 201

@watchlist_routes.route('/<int:watchlist_id>', methods=['DELETE'])
@login_required
def delete_watchlist(watchlist_id):
    watchlist = Watchlist.query.filter_by(id=watchlist_id, user_id=current_user.id).first()

    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404

    watchlist.deleted = True
    db.session.delete(watchlist)
    db.session.commit()
    return jsonify({'message': 'Watchlist deleted successfully'}), 200

@watchlist_routes.route('/', methods=['GET'])
@login_required
def get_watchlists():
    watchlists = Watchlist.query.filter_by(user_id=current_user.id, deleted=False).all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])


@watchlist_routes.route('/<int:watchlist_id>/add', methods=['POST'])
@login_required
def add_to_watchlist(watchlist_id):
    data = request.get_json()
    print("Request data:", data)  # Debug log
    stock_id = data.get('stock_id')

    if not stock_id:
        return jsonify({'error': 'Stock ID is required'}), 400

    # Prevent duplicates
    existing = WatchlistStock.query.filter_by(watchlist_id=watchlist_id, stock_id=stock_id).first()
    if existing:
        return jsonify({'message': 'Stock already in watchlist'}), 200

    new_watch = WatchlistStock(watchlist_id=watchlist_id, stock_id=stock_id)
    db.session.add(new_watch)
    db.session.commit()
    return jsonify({'message': 'Stock added to watchlist'}), 201


@watchlist_routes.route('/<int:watchlist_id>/remove', methods=['DELETE'])
@login_required
def remove_from_watchlist(watchlist_id):
    data = request.get_json()
    ticker = data.get('ticker')
    if not ticker:
        return jsonify({'error': 'Stock symbol is required'}), 400

    # Find the stock by ticker
    stock = Stock.query.filter_by(ticker=ticker).first()
    if not stock:
        return jsonify({'error': 'Stock not found'}), 404

    # Find the WatchlistStock entry
    watch_item = WatchlistStock.query.filter_by(watchlist_id=watchlist_id, stock_id=stock.id).first()
    if not watch_item:
        return jsonify({'error': 'Stock not found in watchlist'}), 404

    db.session.delete(watch_item)
    db.session.commit()
    return jsonify({'message': 'Stock removed from watchlist'}), 200
