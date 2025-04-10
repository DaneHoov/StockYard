from ..models import db

class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stock'
    watchlist_id = db.Column(db.Integer, db.ForeignKey('watchlists.id'), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), primary_key=True)

    watchlist = db.relationship('Watchlist')

    def __repr__(self):
        return f'<WatchlistStock {self.watchlist_id}, {self.stock_id}>'
    def __init__(self, watchlist_id, stock_id):
        self.watchlist_id = watchlist_id
        self.stock_id = stock_id
