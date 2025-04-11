from app import app
from app.models import db, User, Portfolio, Stock, Transaction, Watchlist, WatchlistStock

def seed_data():
    with app.app_context():
        # Clear existing data (optional, be careful with this in prod)
        db.drop_all()
        db.create_all()

        # Create users
        user1 = User(username="DemoUser", email="ex@mple.com", password="password")


        db.session.add(user1)
        db.session.commit()

        # Portfolios
        portfolio1 = Portfolio(user_id=user1.id)
        db.session.add(portfolio1)

        # Stocks
        stock1 = Stock(ticker="AAPL", name="Apple Inc.", price=190.42, exchange="NASDAQ", sector="Technology")
        stock2 = Stock(ticker="GOOGL", name="Alphabet Inc.", price=155.37, exchange="NASDAQ", sector="Technology")
        db.session.add_all([stock1, stock2])
        db.session.commit()

        # Transactions
        tx1 = Transaction(portfolio_id=portfolio1.id, stock_id=stock1.id, transaction_type='buy', quantity=10, price_per_share=190.42)
        tx2 = Transaction(portfolio_id=portfolio1.id, stock_id=stock2.id, transaction_type='sell', quantity=5, price_per_share=155.37)
        db.session.add_all([tx1, tx2])

        # Watchlists
        watchlist1 = Watchlist(user_id=user1.id, name="Tech Stocks")
        db.session.add(watchlist1)
        db.session.commit()

        # WatchlistStock join table
        ws1 = WatchlistStock(watchlist_id=watchlist1.id, stock_id=stock1.id)
        ws2 = WatchlistStock(watchlist_id=watchlist1.id, stock_id=stock2.id)
        db.session.add_all([ws1, ws2])

        db.session.commit()
        print("Seed data inserted!")

if __name__ == "__main__":
    seed_data()

