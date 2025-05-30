from .db import db, environment, SCHEMA

class Stock(db.Model):
    __tablename__ = 'stocks'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    exchange = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    sector = db.Column(db.String(50), nullable=False)

    transactions = db.relationship('Transaction', back_populates='stock')
    portfolio_stocks = db.relationship('PortfolioStock', back_populates='stock', cascade="all, delete-orphan")
    watchlist_stocks = db.relationship('WatchlistStock', back_populates='stock')
    watchlists = db.relationship('Watchlist', f'{SCHEMA}.watchlist_stocks' if environment == "production" else 'watchlist_stocks', back_populates='stocks', overlaps="watchlist_stocks")

    def to_dict(self):
        return {
            'id': self.id,
            'ticker': self.ticker,
            'name': self.name,
            'exchange': self.exchange,
            'sector': self.sector,
            'price': self.price,

        }

    def to_dict_basic(self):
        return {
            'id': self.id,
            'ticker': self.ticker,
            'name': self.name,
            'price': self.price,
        }
