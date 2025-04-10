from flask.cli import FlaskGroup
from app import app, db  # Import app and db directly

cli = FlaskGroup(app)

if __name__ == '__main__':
    cli()
