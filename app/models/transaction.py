from .db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    ticker = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', back_populates='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_id': self.stock_id,
            'account_id': self.account_id,
            'ticker': self.ticker,
            'quantity': self.quantity,
            'price': self.price,
            'status': self.status
        }
