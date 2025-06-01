from flask.cli import AppGroup
from app.models.db import db, environment, SCHEMA
from .users import seed_users, undo_users
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .transactions import seed_transactions, undo_transactions
from sqlalchemy import text
import time
import psycopg2
import os

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
        if environment == "production":
            # Use single transaction for all dependent data on production
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()

            try:
                # Begin transaction
                cursor.execute("BEGIN")

                # Insert users first
                print("🌱 Seeding users...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.users (username, email, phone, hashed_password) VALUES
                    ('Demo', 'demo@aa.io', '+11234567890', 'pbkdf2:sha256:260000$demo$hashedpassword'),
                    ('marnie', 'marnie@aa.io', '+18675309', 'pbkdf2:sha256:260000$marnie$hashedpassword'),
                    ('bobbie', 'bobbie@aa.io', '+19999999999', 'pbkdf2:sha256:260000$bobbie$hashedpassword')
                """)
                print("✅ Users seeded")

                # Insert stocks
                print("🌱 Seeding stocks...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.stocks (ticker, name, exchange, price, sector) VALUES
                    ('AAPL', 'Apple Inc.', 'NASDAQ', 175.64, 'Technology'),
                    ('GOOG', 'Alphabet Inc.', 'NASDAQ', 135.12, 'Technology'),
                    ('MSFT', 'Microsoft Corp.', 'NASDAQ', 320.45, 'Technology'),
                    ('AMZN', 'Amazon.com Inc.', 'NASDAQ', 135.67, 'Consumer Discretionary'),
                    ('NVDA', 'NVIDIA Corp.', 'NASDAQ', 450.23, 'Technology'),
                    ('TSLA', 'Tesla Inc.', 'NASDAQ', 245.12, 'Consumer Discretionary'),
                    ('PLTR', 'Palantir Technologies', 'NYSE', 17.45, 'Technology')
                """)
                print("✅ Stocks seeded")

                # Insert portfolios using the users from the same transaction
                print("🌱 Seeding portfolios...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.portfolios (user_id, balance)
                    SELECT u.id, p.balance FROM (VALUES
                        ('Demo', 10000.0),
                        ('marnie', 5000.0)
                    ) AS p(username, balance)
                    JOIN {SCHEMA}.users u ON u.username = p.username
                """)
                print("✅ Portfolios seeded")

                # Insert portfolio_stocks using the same transaction data
                print("🌱 Seeding portfolio_stocks...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.portfolio_stocks (portfolio_id, stock_id, quantity, purchase_price, purchase_date)
                    SELECT p.id, s.id, ps.quantity, ps.purchase_price, ps.purchase_date
                    FROM (VALUES
                        ('Demo', 'AAPL', 10, 190.42, '2023-10-01'::date),
                        ('marnie', 'GOOG', 5, 155.37, '2023-10-02'::date)
                    ) AS ps(username, ticker, quantity, purchase_price, purchase_date)
                    JOIN {SCHEMA}.users u ON u.username = ps.username
                    JOIN {SCHEMA}.portfolios p ON p.user_id = u.id
                    JOIN {SCHEMA}.stocks s ON s.ticker = ps.ticker
                """)
                print("✅ Portfolio stocks seeded")

                # Insert transactions using the same transaction data
                print("🌱 Seeding transactions...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.transactions (user_id, portfolio_id, stock_id, transaction_type, quantity, price, total_value, status, date)
                    SELECT u.id, p.id, s.id, t.transaction_type, t.quantity, t.price, t.total_value, t.status, t.date
                    FROM (VALUES
                        ('Demo', 'AAPL', 'buy', 10, 190.42, 1904.2, 'completed', '2023-10-01'::date),
                        ('marnie', 'GOOG', 'sell', 5, 155.37, 776.85, 'completed', '2023-10-02'::date)
                    ) AS t(username, ticker, transaction_type, quantity, price, total_value, status, date)
                    JOIN {SCHEMA}.users u ON u.username = t.username
                    JOIN {SCHEMA}.portfolios p ON p.user_id = u.id
                    JOIN {SCHEMA}.stocks s ON s.ticker = t.ticker
                """)
                print("✅ Transactions seeded")

                # Commit everything at once
                cursor.execute("COMMIT")
                cursor.close()
                conn.close()
                print("✅ All seeding completed successfully!")

            except Exception as e:
                cursor.execute("ROLLBACK")
                cursor.close()
                conn.close()
                raise e
        else:
            # Use separate transactions for development
            print("🌱 Seeding users...")
            users_table = "users"
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
            seed_portfolios()
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
        if 'cursor' in locals():
            cursor.execute("ROLLBACK")
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
