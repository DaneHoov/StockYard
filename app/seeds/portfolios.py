from app.models import db, Portfolio, User, environment, SCHEMA
from sqlalchemy.sql import text

def seed_portfolios():
    demo = User.query.filter_by(username='Demo').first()
    marnie = User.query.filter_by(username='marnie').first()
    if demo and marnie:
        portfolio1 = Portfolio(user_id=demo.id, balance=10000.0)
        portfolio2 = Portfolio(user_id=marnie.id, balance=5000.0)
        db.session.add_all([portfolio1, portfolio2])
        db.session.commit()

def undo_portfolios():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.portfolios RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM portfolios"))
    db.session.commit()
