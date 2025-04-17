from app.models import db, Portfolio

def seed_portfolios():
    portfolio1 = Portfolio(user_id=1)
    db.session.add(portfolio1)
    db.session.commit()

def undo_portfolios():
    db.session.execute("DELETE FROM portfolios")
    db.session.commit()
