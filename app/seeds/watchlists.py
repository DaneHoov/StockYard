from app.models import db, Watchlist
from sqlalchemy.sql import text

def seed_watchlists():
    watchlist1 = Watchlist(user_id=1, name="Tech Stocks")
    watchlist2 = Watchlist(user_id=1, name="Growth Stocks")
    watchlist3 = Watchlist(user_id=2, name="Dividend Stocks")
    watchlist4 = Watchlist(user_id=2, name="Value Stocks")

    db.session.add_all([watchlist1, watchlist2, watchlist3, watchlist4])
    db.session.commit()
def undo_watchlists():
    db.session.execute(text("DELETE FROM watchlists"))
    db.session.commit()
