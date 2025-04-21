from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from app.models import User


def user_exists(form, field):
    # Checking if user exists
    identifier = field.data
    if identifier.startswith('+') and identifier[1:].isdigit():  # Phone number
        user = User.query.filter(User.phone == identifier).first()
    else:  # Otherwise, treat it as an email
        user = User.query.filter(User.email == identifier).first()

    if not user:
        raise ValidationError('No such user exists.')


def password_matches(form, field):
    # Checking if password matches
    password = field.data
    identifier = form.data['email']  # This can be an email or phone number

    # Determine if the identifier is a phone number or email
    if identifier.startswith('+') and identifier[1:].isdigit():  # Phone number
        user = User.query.filter(User.phone == identifier).first()
    else:  # Email
        user = User.query.filter(User.email == identifier).first()

    if not user:
        raise ValidationError('No such user exists.')
    if not user.check_password(password):
        raise ValidationError('Password was incorrect.')


class LoginForm(FlaskForm):
    email = StringField('email', validators=[DataRequired(), user_exists])
    password = StringField('password', validators=[DataRequired(), password_matches])
