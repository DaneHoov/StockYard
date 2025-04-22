from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from .db import db, environment, SCHEMA
from .portfolio import Portfolio
from .watchlist import Watchlist

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(15), nullable=True, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)

    # Relationships
    user.portfolios = db.relationship('Portfolio', back_populates='user', cascade='all, delete-orphan')
    user.watchlists = db.relationship('Watchlist', back_populates='user', cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', back_populates='user', cascade='all, delete-orphan')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'portfolios': [portfolio.to_dict_basic() for portfolio in self.portfolios],
            'watchlists': [watchlist.to_dict_basic() for watchlist in self.watchlists],
            'transactions': [transaction.to_dict_basic() for transaction in self.transactions]
        }
