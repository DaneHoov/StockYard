import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")



# helper function for adding prefix to foreign key column references in production
def add_prefix_for_prod(attr):
    if environment == "production" and SCHEMA:
        return f"{SCHEMA}.{attr}"
    return attr
