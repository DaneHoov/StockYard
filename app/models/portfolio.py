from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False, unique=True)
    cash_balance = db.Column(db.Float, default=0.0)
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 572533a (migration and jsx done)
=======
>>>>>>> 9a957cc (updated seeders and other files)
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance
        }
