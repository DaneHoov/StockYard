from app.models import db, WatchlistStock
from sqlalchemy.sql import text

def seed_watchlist_stocks():
    watchlist_stock1 = WatchlistStock(watchlist_id=1, stock_id=1)
    watchlist_stock2 = WatchlistStock(watchlist_id=1, stock_id=2)
    db.session.add_all([watchlist_stock1, watchlist_stock2])
    db.session.commit()
def undo_watchlist_stocks():
    db.session.execute(text("DELETE FROM watchlist_stocks"))
    db.session.commit()
