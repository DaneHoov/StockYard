from .db import db, add_prefix_for_prod, environment, SCHEMA
from datetime import datetime


class Transaction(db.Model):
    __tablename__ = 'transactions'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='transactions')
    portfolio = db.relationship('Portfolio', back_populates='transactions')
    stock = db.relationship('Stock', back_populates='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'portfolio_id': self.portfolio_id,
            'stock_id': self.stock_id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'price': self.price,
            'total_value': self.total_value,
            'status': self.status,
            'date': self.date.isoformat(),
        }

    def to_dict_basic(self):
        return {
            'id': self.id,
            "ticker": self.stock.ticker if self.stock else None,
            'quantity': self.quantity,
            'price': self.price,
            'type': self.transaction_type,
            'date': self.date.isoformat() if self.date else None,
            'portfolio_id': self.portfolio_id
        }
