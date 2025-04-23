from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import db, Portfolio, PortfolioStock

portfolio_routes = Blueprint('portfolio', __name__)

@portfolio_routes.route('/<int:user_id>', methods=['GET'])
@login_required
def get_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {"message": "Portfolio not found."}, 404

    return portfolio.to_dict()


@portfolio_routes.route('/create', methods=['POST'])
@login_required
def create_portfolio():
    new_portfolio = Portfolio(user_id=current_user.id, balance=0.0)
    db.session.add(new_portfolio)
    db.session.commit()
    return new_portfolio.to_dict(), 201


@portfolio_routes.route('/<int:user_id>', methods=['PUT'])
@login_required
def update_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {"message": "Portfolio not found."}, 404

    data = request.get_json()
    add_cash = data.get('add_cash', 0.0)
    portfolio.balance += float(add_cash)
    db.session.commit()
    return portfolio.to_dict()

@portfolio_routes.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_portfolio(user_id):
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {"message": "Portfolio not found."}, 404

    db.session.delete(portfolio)
    db.session.commit()
    return {"message": "Portfolio deleted successfully."}


@portfolio_routes.route('/<int:user_id>/stocks', methods=['POST'])
@login_required
def add_to_portfolio(user_id):
    data = request.get_json()
    print("📦 Received JSON data:", data)
    stock_id = data.get('stock_id')
    quantity = data.get('quantity', 1)

    if not stock_id:
        print("❌ Missing stock_id in request")
        return {'error': 'Stock ID is required'}, 400

    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return {'error': 'Portfolio not found'}, 404

    # Check if the stock already exists in the portfolio
    portfolio_stock = PortfolioStock.query.filter_by(
        portfolio_id=portfolio.id,
        stock_id=stock_id
    ).first()

    if portfolio_stock:
        portfolio_stock.quantity += quantity
    else:
        new_entry = PortfolioStock(
            portfolio_id=portfolio.id,
            stock_id=stock_id,
            quantity=quantity
        )
        db.session.add(new_entry)

    db.session.commit()
    return portfolio.to_dict()
