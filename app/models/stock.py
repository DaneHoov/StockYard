from .db import db

class Stock(db.Model):
    __tablename__ = 'stocks'

    id = db.Column(db.Integer, primary_key=True)
    portfiolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    ticker = db.Column(db.String(10), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    exchange = db.Column(db.String(10), nullable=False)
    sector = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Stock {self.ticker}>'

    def __init__(self, ticker, name, price, exchange, sector):
        self.ticker = ticker
        self.name = name
        self.price = price
        self.exchange = exchange
        self.sector = sector
