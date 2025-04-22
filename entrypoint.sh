#!/bin/sh

echo "Waiting for database..."
until psql $DATABASE_URL -c '\q'; do
  >&2 echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

# Run database migrations
if ! flask db upgrade; then
  >&2 echo "Database migration failed!"
  exit 1
fi

# Seed the database
if ! flask seed all; then
  >&2 echo "Database seeding failed!"
  exit 1
fi

# Start the application
exec gunicorn app:app
