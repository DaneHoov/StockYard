from .db import db, add_prefix_for_prod, environment, SCHEMA

class Watchlist(db.Model):
    __tablename__ = 'watchlists'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    deleted = db.Column(db.Boolean, nullable=False, default=False)

    user = db.relationship('User', back_populates='watchlists')
    watchlist_stocks = db.relationship('WatchlistStock', back_populates='watchlist', cascade='all, delete-orphan')
    stocks = db.relationship('Stock', secondary='watchlist_stocks', back_populates='watchlists', overlaps="watchlist_stocks")

    def __repr__(self):
        return f'<Watchlist {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'stocks': [stock.to_dict_basic() for stock in self.stocks],
            'deleted': self.deleted,

        }

    def to_dict_basic(self):
        return {
            'id': self.id,
            'name': self.name
        }
