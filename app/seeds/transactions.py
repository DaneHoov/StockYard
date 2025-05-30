from app.models import db, Transaction, User, Portfolio, Stock, environment, SCHEMA
from datetime import datetime
from sqlalchemy.sql import text

def seed_transactions():
    # Create the first transaction (buying 10 shares of AAPL)
    demo = User.query.filter_by(username='Demo').first()
    marnie = User.query.filter_by(username='marnie').first()
    portfolio1 = Portfolio.query.filter_by(user_id=demo.id).first() if demo else None
    portfolio2 = Portfolio.query.filter_by(user_id=marnie.id).first() if marnie else None
    aapl = Stock.query.filter_by(ticker='AAPL').first()
    goog = Stock.query.filter_by(ticker='GOOG').first()
    if demo and portfolio1 and aapl and marnie and portfolio2 and goog:
        transaction1 = Transaction(
            user_id=demo.id,
            portfolio_id=portfolio1.id,
            stock_id=aapl.id,
            transaction_type="buy",
            quantity=10,
            price=190.42,
            total_value=10 * 190.42,
            status="completed",
            date=datetime(2023, 10, 1),
        )
        # Create the second transaction (selling 5 shares of GOOGL)
        transaction2 = Transaction(
            user_id=marnie.id,
            portfolio_id=portfolio2.id,
            stock_id=goog.id,
            transaction_type="sell",
            quantity=5,
            price=155.37,
            total_value=5 * 155.37,
            status="completed",
            date=datetime(2023, 10, 2),
        )
        db.session.add_all([transaction1, transaction2])
        db.session.commit()


def undo_transactions():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.transactions RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM transactions"))
    db.session.commit()
    # db.session.execute(text("DELETE FROM transactions"))
    # db.session.commit()
