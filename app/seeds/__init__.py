from flask.cli import AppGroup
from .users import seed_users, undo_users
from .portfolios import seed_portfolios, undo_portfolios
from app.models.db import db, environment, SCHEMA


seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    if environment == 'production':
        undo_portfolios()
        undo_users()

    seed_users()
    seed_portfolios()


@seed_commands.command('undo')
def undo():
    undo_portfolios()
    undo_users()


@seed_commands.command('portfolio')
def seed_portfolio():
    seed_portfolios()


@seed_commands.command('undo_portfolio')
def undo_portfolio():
    undo_portfolios()
