from app.models import db, Stock, environment, SCHEMA
from sqlalchemy.sql import text

def seed_stocks():
    stocks = [
        Stock(ticker="AAPL", name="Apple Inc.", price=175.64, exchange="NASDAQ", sector="Technology"),
        Stock(ticker="GOOG", name="Alphabet Inc.", price=135.12, exchange="NASDAQ", sector="Technology"),
        Stock(ticker="MSFT", name="Microsoft Corp.", price=320.45, exchange="NASDAQ", sector="Technology"),
        Stock(ticker="AMZN", name="Amazon.com Inc.", price=135.67, exchange="NASDAQ", sector="Consumer Discretionary"),
        Stock(ticker="NVDA", name="NVIDIA Corp.", price=450.23, exchange="NASDAQ", sector="Technology"),
        Stock(ticker="TSLA", name="Tesla Inc.", price=245.12, exchange="NASDAQ", sector="Consumer Discretionary"),
        Stock(ticker="PLTR", name="Palantir Technologies", price=17.45, exchange="NYSE", sector="Technology"),
    ]

    db.session.add_all(stocks)
    db.session.commit()

def undo_stocks():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.stocks RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM stocks"))
    db.session.commit()
