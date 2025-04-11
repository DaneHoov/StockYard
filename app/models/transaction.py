from .db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_per_share = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(10), nullable=False, default='pending')  # 'pending', 'completed', 'failed'

    portfolio = db.relationship('Portfolio', back_populates='transactions')
    user = db.relationship('User', back_populates='transactions')

    def __repr__(self):
        return f'<Transaction {self.id}>'
