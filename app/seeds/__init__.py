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

    try:
        if environment == "production":
            # Production seeding using raw SQL in a single transaction
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()

            try:
                cursor.execute("BEGIN")
                print("🌱 Seeding users...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.users (username, email, phone, hashed_password) VALUES
                    ('Demo', 'demo@aa.io', '+11234567890', 'pbkdf2:sha256:260000$demo$hashedpassword'),
                    ('marnie', 'marnie@aa.io', '+18675309', 'pbkdf2:sha256:260000$marnie$hashedpassword'),
                    ('bobbie', 'bobbie@aa.io', '+19999999999', 'pbkdf2:sha256:260000$bobbie$hashedpassword')
                """)
                print("✅ Users seeded")

                cursor.execute(f"SELECT id, username FROM {SCHEMA}.users")
                users = cursor.fetchall()
                print(f"🔍 User data: {users}")

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

                print("🌱 Seeding portfolios...")
                cursor.execute(f"""
                    SELECT id FROM {SCHEMA}.users WHERE username IN ('Demo', 'marnie') ORDER BY username
                """)
                user_ids = cursor.fetchall()
                print(f"🔍 Found user IDs for portfolios: {user_ids}")

                if len(user_ids) >= 2:
                    demo_id, marnie_id = user_ids[0][0], user_ids[1][0]
                    cursor.execute(f"""
                        INSERT INTO {SCHEMA}.portfolios (user_id, balance) VALUES
                        ({demo_id}, 10000.0),
                        ({marnie_id}, 5000.0)
                    """)
                    print("✅ Portfolios seeded with explicit IDs")
                else:
                    raise Exception(f"Expected 2 users, found {len(user_ids)}")

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

                cursor.execute("COMMIT")
                print("✅ All seeding completed successfully!")

            except Exception as e:
                print(f"💥 Error during seeding: {e}")
                try:
                    cursor.execute("ROLLBACK")
                    print("🔄 Transaction rolled back")
                except:
                    print("⚠️ Could not rollback - connection may be closed")
                raise e
            finally:
                try:
                    cursor.close()
                    conn.close()
                except:
                    pass

        else:
            # Development seeding using SQLAlchemy ORM
            print("🌱 Seeding users...")
            seed_users()
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
