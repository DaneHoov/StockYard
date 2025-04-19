from flask.cli import AppGroup
from .users import seed_users, undo_users
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .transactions import seed_transactions, undo_transactions
from .watchlists import seed_watchlists, undo_watchlists
from .watchlist_stocks import seed_watchlist_stocks, undo_watchlist_stocks

from app.models.db import db, environment, SCHEMA


seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    undo_watchlist_stocks()
    undo_transactions()
    undo_portfolio_stocks()
    undo_watchlists()
    undo_portfolios()
    undo_stocks()
    undo_users()

    seed_users()
    seed_stocks()
    seed_portfolios()
    seed_watchlists()
    seed_portfolio_stocks()
    seed_watchlist_stocks()
    seed_transactions()
    # Add other seed functions here


@seed_commands.command('undo')
def undo():
    undo_watchlist_stocks()
    undo_transactions()
    undo_portfolio_stocks()
    undo_watchlists()
    undo_portfolios()
    undo_stocks()
    undo_users()
    # Add other undo functions here
