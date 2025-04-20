from .db import db

class Watchlist(db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='watchlists')
    stocks = db.relationship('Stock', secondary='watchlist_stocks', back_populates='watchlists', overlaps="watchlist_stocks")
    watchlist_stocks = db.relationship('WatchlistStock', back_populates='watchlist', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Watchlist {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'stocks': [stock.to_dict_basic() for stock in self.stocks]
        }

    def to_dict_basic(self):
        return {
            'id': self.id,
            'name': self.name
        }
