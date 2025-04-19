from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("users.id")),
        nullable=False,
        unique=True
    )
    balance = db.Column(db.Float, default=0.0, nullable=False)
    user = db.relationship('User', back_populates='portfolios')
    portfolio_stocks = db.relationship('PortfolioStock', back_populates='portfolio', cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', back_populates='portfolio', cascade='all, delete-orphan')
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance
        }
