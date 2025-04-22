# FROM python:3.9.18-alpine3.18

# RUN apk add build-base
# RUN apk add postgresql-dev gcc python3-dev musl-dev

# ARG FLASK_APP
# ARG FLASK_ENV
# ARG DATABASE_URL
# ARG SCHEMA
# # ARG SECRET_KEY
# ENV DATABASE_URL=sqlite:///dev.db

# WORKDIR /var/www

# COPY requirements.txt .

# RUN pip install -r requirements.txt
# RUN pip install psycopg2

# COPY . .

# # Copy the entrypoint script
# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]
# CMD ["gunicorn", "app:app"]

FROM python:3.9.18-alpine3.18

RUN apk add build-base
RUN apk add postgresql-dev gcc python3-dev musl-dev

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2
RUN pip install psycopg2-binary

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
