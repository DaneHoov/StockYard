from app.models import db, Portfolio, environment, SCHEMA
from sqlalchemy.sql import text

def seed_portfolios():
    portfolio1 = Portfolio(user_id=1, balance=10000.0)
    portfolio2 = Portfolio(user_id=2, balance=5000.0)
    db.session.add_all([portfolio1, portfolio2])
    db.session.commit()

def undo_portfolios():
    if environment == "production":
        db.session.execute("TRUNCATE TABLE stockyard_schema.portfolios RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM portfolios"))
    db.session.commit()
