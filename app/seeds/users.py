from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(
        username='Demo', email='demo@aa.io', phone="+11234567890")
    demo.password = 'password'
    marnie = User(
        username='marnie', email='marnie@aa.io', phone="+18675309")
    marnie.password = 'password'
    bobbie = User(
        username='bobbie', email='bobbie@aa.io', phone="+19999999999")
    bobbie.password = 'password'

    db.session.add_all([demo, marnie, bobbie])
    db.session.commit()
    db.session.expire_all()


# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
    db.session.commit()
