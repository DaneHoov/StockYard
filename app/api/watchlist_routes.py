from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, WatchlistStock, Watchlist

watchlist_routes = Blueprint('watchlist', __name__)

@watchlist_routes.route('/watchlist', methods=['GET'])
@login_required
def get_watchlist():
    watchlist = WatchlistStock.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': item.stock.id,
        'symbol': item.stock.ticker,
        'price': item.stock.price,
        'change': item.stock.change,
    } for item in watchlist])

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
    existing_watchlist = Watchlist.query.filter_by(user_id=current_user.id, name=name).first()
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

    db.session.delete(watchlist)
    db.session.commit()
    return jsonify({'message': 'Watchlist deleted successfully'}), 200

@watchlist_routes.route('/', methods=['GET'])
@login_required
def get_watchlists():
    watchlists = Watchlist.query.filter_by(user_id=current_user.id).all()
    return jsonify([watchlist.to_dict() for watchlist in watchlists])


# @watchlist_routes.route('/watchlist', methods=['POST'])
# @login_required
# def add_to_watchlist():
#     data = request.get_json()
#     stock_id = data.get('stock_id')

#     if not stock_id:
#         return jsonify({'error': 'Stock ID is required'}), 400

#     # Prevent duplicates
#     existing = WatchlistStock.query.filter_by(user_id=current_user.id, stock_id=stock_id).first()
#     if existing:
#         return jsonify({'message': 'Stock already in watchlist'}), 200

#     new_watch = WatchlistStock(user_id=current_user.id, stock_id=stock_id)
#     db.session.add(new_watch)
#     db.session.commit()
#     return jsonify({'message': 'Stock added to watchlist'}), 201


# @watchlist_routes.route('/watchlist<int:stock_id>', methods=['DELETE'])
# @login_required
# def remove_from_watchlist(stock_id):
#     print(f"Received stock_id: {stock_id}")  # Debugging log
#     watch_item = WatchlistStock.query.filter_by(user_id=current_user.id, stock_id=stock_id).first()
#     if not watch_item:
#         print("Stock not found in watchlist")  # Debugging log
#         return jsonify({'error': 'Stock not found in watchlist'}), 404

#     print(f"Removing watch_item: {watch_item}")  # Debugging log
#     db.session.delete(watch_item)
#     db.session.commit()
#     return jsonify({'message': 'Stock removed from watchlist'}), 200
