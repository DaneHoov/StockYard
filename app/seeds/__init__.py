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
    undo_transactions()
    undo_portfolio_stocks()
    undo_portfolios()
    undo_stocks()
    undo_users()

    seed_users()
    seed_stocks()
    seed_portfolios()
    seed_portfolio_stocks()
    seed_transactions()
    # Add other seed functions here


@seed_commands.command('undo')
def undo():
    undo_transactions()
    undo_portfolio_stocks()
    undo_portfolios()
    undo_stocks()
    undo_users()
    # Add other undo functions here
