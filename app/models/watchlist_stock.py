from ..models import db

class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stocks'
    watchlist_id = db.Column(db.Integer, db.ForeignKey('watchlists.id'), primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), primary_key=True)

    watchlist = db.relationship('Watchlist')
    stock = db.relationship('Stock', back_populates='watchlist_stocks')

    def __repr__(self):
        return f'<WatchlistStock {self.watchlist_id}, {self.stock_id}>'
