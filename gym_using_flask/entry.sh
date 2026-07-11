#!/bin/bash
echo "sleeping 10 s untill the database boots"
sleep 10 
# Create migrations only once
if [ ! -d "migrations" ]; then
    echo "Initializing migrations..."
    flask db init
    flask db migrate -m "Initial schema"
fi

echo "Applying migrations..."
flask db upgrade

echo "Starting Flask..."
exec python run.py
