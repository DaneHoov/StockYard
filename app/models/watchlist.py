from .db import db

class Watchlist(db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)

    user = db.relationship('User', back_populates='watchlists')
    stocks = db.relationship(
        'Stock',
        secondary='watchlist_stock',
        backref=db.backref('watchlists', lazy='dynamic')
    )

    def __repr__(self):
        return f'<Watchlist {self.id}>'

    def __init__(self, user_id, name):
        self.user_id = user_id
        self.name = name
