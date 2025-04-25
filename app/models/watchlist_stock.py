from ..models import db

class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stocks'
    watchlist_id = db.Column(db.Integer, db.ForeignKey('watchlists.id'), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Define relationships
    watchlist = db.relationship('Watchlist', back_populates='watchlist_stocks', overlaps="stocks,watchlists")
    stock = db.relationship('Stock', back_populates='watchlist_stocks', overlaps="stocks,watchlists")

    def __repr__(self):
        return f'<WatchlistStock {self.watchlist_id}, {self.stock_id}>'

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'watchlist_id': self.watchlist_id,
            'stock_id': self.stock_id,
            'stock': self.stock.to_dict_basic()
        }
