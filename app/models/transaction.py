from .db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    quantity = db.Column(db.Integer, nullable=False)
    price_per_share = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(10), nullable=False, default='pending')  # 'pending', 'completed', 'failed'

    portfolio = db.relationship('Portfolio', back_populates='transactions')
    stock = db.relationship('Stock', back_populates='transactions')

    def __repr__(self):
        return f'<Transaction {self.id}>'

    def __init__(self, portfolio_id, stock_id, transaction_type, quantity, price_per_share):
        self.portfolio_id = portfolio_id
        self.stock_id = stock_id
        self.transaction_type = transaction_type
        self.quantity = quantity
        self.price_per_share = price_per_share
        self.total_cost = quantity * price_per_share
