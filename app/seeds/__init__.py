from flask.cli import AppGroup
from app.models.db import db, environment, SCHEMA
from .users import seed_users, undo_users
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .transactions import seed_transactions, undo_transactions




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
        seed_users()
        db.session.commit()  # Commit users first
        db.session.close()   # Force new connection

        print("🌱 Seeding stocks...")
        seed_stocks()
        db.session.commit()  # Commit stocks
        db.session.close()   # Force new connection

        print("🌱 Seeding portfolios...")
        seed_portfolios()
        db.session.commit()  # Commit portfolios
        db.session.close()   # Force new connection

        print("🌱 Seeding portfolio_stocks...")
        seed_portfolio_stocks()
        db.session.commit()  # Commit portfolio_stocks
        db.session.close()   # Force new connection

        print("🌱 Seeding transactions...")
        seed_transactions()
        db.session.commit()  # Commit transactions
        db.session.close()   # Force new connection

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
