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

    # Start a single transaction for all seeding
    try:
        seed_users()
        db.session.flush()  # Flush to make users available for FK references

        seed_stocks()
        db.session.flush()  # Flush to make stocks available for FK references

        seed_portfolios()
        db.session.flush()  # Flush to make portfolios available for FK references

        seed_portfolio_stocks()
        db.session.flush()  # Flush to make portfolio_stocks available for FK references

        seed_transactions()

        # Commit everything at once
        db.session.commit()
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
