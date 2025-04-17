from .db import db

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, default=0.0)

    user = db.relationship('User', back_populates='portfolios')
    transactions = db.relationship('Transaction', back_populates='portfolio', cascade='all, delete-orphan')
    portfolio_stocks = db.relationship('PortfolioStock', back_populates='portfolio', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Portfolio id={self.id}, user_id={self.user_id}, balance={self.balance}>'
    def __init__(self, user_id, balance=0.0):
        self.user_id = user_id
        self.balance = balance
    def add_balance(self, amount):
        self.balance += amount
        db.session.commit()
