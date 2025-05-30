from app.models import db, PortfolioStock, Portfolio, Stock, environment, SCHEMA
from datetime import datetime
from sqlalchemy.sql import text

def seed_portfolio_stocks():
    portfolio1 = Portfolio.query.join('user').filter_by(username='Demo').first()
    portfolio2 = Portfolio.query.join('user').filter_by(username='marnie').first()
    aapl = Stock.query.filter_by(ticker='AAPL').first()
    goog = Stock.query.filter_by(ticker='GOOG').first()
    if portfolio1 and aapl and portfolio2 and goog:
        portfolio_stock1 = PortfolioStock(
            portfolio_id=portfolio1.id,
            stock_id=aapl.id,
            quantity=10,
            purchase_price=190.42,
            purchase_date=datetime(2023, 10, 1)
        )
        portfolio_stock2 = PortfolioStock(
            portfolio_id=portfolio2.id,
            stock_id=goog.id,
            quantity=5,
            purchase_price=155.37,
            purchase_date=datetime(2023, 10, 2)
        )
        db.session.add_all([portfolio_stock1, portfolio_stock2])
        db.session.commit()

def undo_portfolio_stocks():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.portfolio_stocks RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM portfolio_stocks"))
    db.session.commit()
