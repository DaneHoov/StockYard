from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='portfolios')
    transactions = db.relationship('Transaction', back_populates='portfolio', cascade='all, delete-orphan')
    portfolio_stocks = db.relationship('PortfolioStock', back_populates='portfolio', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Portfolio id={self.id}, user_id={self.user_id}, balance={self.balance}>'

    def add_balance(self, amount):
        self.balance += amount
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'balance': self.balance,
            'transactions': [transaction.to_dict_basic() for transaction in self.transactions],
            'portfolio_stocks': [ps.to_dict() for ps in self.portfolio_stocks]
        }

    def to_dict_basic(self):  # for use in nested objects like User
        return {
            'id': self.id,
            'balance': self.balance
        }
