from flask.cli import AppGroup
from app.models.db import db, environment, SCHEMA
from .users import seed_users, undo_users
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .transactions import seed_transactions, undo_transactions
from sqlalchemy import text



seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    if environment == "production":
        undo_transactions()
        undo_portfolio_stocks()
        undo_portfolios()
        undo_stocks()
        undo_users()

    # Seed each table in separate transactions to avoid FK issues
    try:
        print("🌱 Seeding users...")
        # Handle schema prefix for production vs development
        users_table = f"{SCHEMA}.users" if environment == "production" and SCHEMA else "users"

        db.session.execute(text(f"""
            INSERT INTO {users_table} (username, email, phone, hashed_password) VALUES
            ('Demo', 'demo@aa.io', '+11234567890', 'pbkdf2:sha256:260000$demo$hashedpassword'),
            ('marnie', 'marnie@aa.io', '+18675309', 'pbkdf2:sha256:260000$marnie$hashedpassword'),
            ('bobbie', 'bobbie@aa.io', '+19999999999', 'pbkdf2:sha256:260000$bobbie$hashedpassword')
        """))
        db.session.commit()
        print("✅ Users seeded")

        print("🌱 Seeding stocks...")
        seed_stocks()
        db.session.commit()
        print("✅ Stocks seeded")

        print("🌱 Seeding portfolios...")
        # Handle schema prefix for both tables
        portfolios_table = f"{SCHEMA}.portfolios" if environment == "production" and SCHEMA else "portfolios"
        users_table = f"{SCHEMA}.users" if environment == "production" and SCHEMA else "users"

        db.session.execute(text(f"""
            INSERT INTO {portfolios_table} (user_id, balance)
            SELECT u.id, p.balance FROM (VALUES
                ('Demo', 10000.0),
                ('marnie', 5000.0)
            ) AS p(username, balance)
            JOIN {users_table} u ON u.username = p.username
        """))
        db.session.commit()
        print("✅ Portfolios seeded")

        print("🌱 Seeding portfolio_stocks...")
        seed_portfolio_stocks()
        db.session.commit()
        print("✅ Portfolio stocks seeded")

        print("🌱 Seeding transactions...")
        seed_transactions()
        db.session.commit()
        print("✅ Transactions seeded")

        print("✅ All seeding completed successfully!")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Seeding failed: {e}")
        raise


@seed_commands.command('undo')
def undo():
    undo_transactions()
    undo_portfolio_stocks()
    undo_portfolios()
    undo_stocks()
    undo_users()
    # Add other undo functions here
