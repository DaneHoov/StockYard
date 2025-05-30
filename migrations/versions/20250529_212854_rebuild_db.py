"""rebuild db

Revision ID: ddd3368a134c
Revises:
Create Date: 2025-05-29 21:28:54.171746

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ddd3368a134c'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS stockyard_schema")
    op.create_table('stocks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticker', sa.String(length=10), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('exchange', sa.String(length=50), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('sector', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticker'),
        schema='stockyard_schema'
    )
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=40), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=15), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('phone'),
        sa.UniqueConstraint('username'),
        schema='stockyard_schema'
    )
    op.create_table('portfolios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('balance', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['stockyard_schema.users.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='stockyard_schema'
    )
    op.create_table('watchlists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('deleted', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['stockyard_schema.users.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='stockyard_schema'
    )
    op.create_table('portfolio_stocks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('portfolio_id', sa.Integer(), nullable=False),
        sa.Column('stock_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('purchase_price', sa.Float(), nullable=True),
        sa.Column('purchase_date', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['stockyard_schema.portfolios.id']),
        sa.ForeignKeyConstraint(['stock_id'], ['stockyard_schema.stocks.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='stockyard_schema'
    )
    op.create_table('transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('portfolio_id', sa.Integer(), nullable=False),
        sa.Column('stock_id', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(length=10), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('total_value', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['portfolio_id'], ['stockyard_schema.portfolios.id']),
        sa.ForeignKeyConstraint(['stock_id'], ['stockyard_schema.stocks.id']),
        sa.ForeignKeyConstraint(['user_id'], ['stockyard_schema.users.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='stockyard_schema'
    )
    op.create_table('watchlist_stocks',
        sa.Column('watchlist_id', sa.Integer(), nullable=False),
        sa.Column('stock_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['stock_id'], ['stockyard_schema.stocks.id']),
        sa.ForeignKeyConstraint(['user_id'], ['stockyard_schema.users.id']),
        sa.ForeignKeyConstraint(['watchlist_id'], ['stockyard_schema.watchlists.id']),
        sa.PrimaryKeyConstraint('watchlist_id', 'stock_id'),
        schema='stockyard_schema'
    )

def downgrade():
    op.drop_table('watchlist_stocks', schema='stockyard_schema')
    op.drop_table('transactions', schema='stockyard_schema')
    op.drop_table('portfolio_stocks', schema='stockyard_schema')
    op.drop_table('watchlists', schema='stockyard_schema')
    op.drop_table('portfolios', schema='stockyard_schema')
    op.drop_table('users', schema='stockyard_schema')
    op.drop_table('stocks', schema='stockyard_schema')
