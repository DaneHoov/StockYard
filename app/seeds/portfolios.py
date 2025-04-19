from app.models import db, Portfolio
from sqlalchemy.sql import text

def seed_portfolios():
    portfolio1 = Portfolio(user_id=1)
    db.session.add(portfolio1)
    db.session.commit()

def undo_portfolios():
    db.session.execute(text("DELETE FROM portfolios"))
    db.session.commit()
