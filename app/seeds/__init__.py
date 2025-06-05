from flask.cli import AppGroup
from app.models.db import db, environment, SCHEMA
from .users import seed_users, undo_users
from .portfolios import seed_portfolios, undo_portfolios
from .stocks import seed_stocks, undo_stocks
from .portfolio_stocks import seed_portfolio_stocks, undo_portfolio_stocks
from .transactions import seed_transactions, undo_transactions
from sqlalchemy import text
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
                    RETURNING id, username
                """)
                users = cursor.fetchall()
                print(f"🔍 Users returned from INSERT: {users}")

                # Create user ID mapping
                user_id_map = {username: user_id for user_id, username in users}
                demo_id = user_id_map.get("Demo")
                marnie_id = user_id_map.get("marnie")
                bobbie_id = user_id_map.get("bobbie")

                print(f"✅ Users seeded. ID mapping: {user_id_map}")
                print(f"🔍 Demo ID: {demo_id}, Marnie ID: {marnie_id}")

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
                # Verify we have the user IDs before proceeding
                if demo_id is None or marnie_id is None:
                    raise Exception(f"Missing user IDs - Demo: {demo_id}, Marnie: {marnie_id}")

                # Use parameterized queries for safety
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.portfolios (user_id, balance) VALUES
                    (%s, %s),
                    (%s, %s)
                    RETURNING id, user_id
                """, (demo_id, 10000.0, marnie_id, 5000.0))

                portfolios = cursor.fetchall()
                portfolio_id_map = {user_id: portfolio_id for portfolio_id, user_id in portfolios}
                print(f"✅ Portfolios seeded. Portfolio mapping: {portfolio_id_map}")

                print("🌱 Seeding portfolio_stocks...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.portfolio_stocks (portfolio_id, stock_id, quantity, purchase_price, purchase_date)
                    SELECT p.id, s.id, ps.quantity, ps.purchase_price, ps.purchase_date::date
                    FROM (VALUES
                        (%s, 'AAPL', 10, 190.42, '2023-10-01'),
                        (%s, 'GOOG', 5, 155.37, '2023-10-02')
                    ) AS ps(user_id, ticker, quantity, purchase_price, purchase_date)
                    JOIN {SCHEMA}.portfolios p ON p.user_id = ps.user_id
                    JOIN {SCHEMA}.stocks s ON s.ticker = ps.ticker
                """, (demo_id, marnie_id))
                print("✅ Portfolio stocks seeded")

                print("🌱 Seeding transactions...")
                cursor.execute(f"""
                    INSERT INTO {SCHEMA}.transactions (user_id, portfolio_id, stock_id, transaction_type, quantity, price, total_value, status, date)
                    SELECT u.id, p.id, s.id, t.transaction_type, t.quantity, t.price, t.total_value, t.status, t.date::date
                    FROM (VALUES
                        (%s, 'AAPL', 'buy', 10, 190.42, 1904.2, 'completed', '2023-10-01'),
                        (%s, 'GOOG', 'sell', 5, 155.37, 776.85, 'completed', '2023-10-02')
                    ) AS t(user_id, ticker, transaction_type, quantity, price, total_value, status, date)
                    JOIN {SCHEMA}.users u ON u.id = t.user_id
                    JOIN {SCHEMA}.portfolios p ON p.user_id = u.id
                    JOIN {SCHEMA}.stocks s ON s.ticker = t.ticker
                """, (demo_id, marnie_id))
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
