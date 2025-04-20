from app.models import db, Transaction
from datetime import datetime
from sqlalchemy.sql import text

def seed_transactions():
    # Create the first transaction (buying 10 shares of AAPL)
    transaction1 = Transaction(
        user_id=1,
        portfolio_id=1,
        stock_id=1,
        transaction_type="buy",
        quantity=10,
        price=190.42,
        total_value=10 * 190.42,
        status="completed",
        date=datetime(2023, 10, 1),
    )

    # Create the second transaction (selling 5 shares of GOOGL)
    transaction2 = Transaction(
        user_id=2,
        portfolio_id=2,
        stock_id=2,
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
    db.session.execute(text("DELETE FROM transactions"))
    db.session.commit()
