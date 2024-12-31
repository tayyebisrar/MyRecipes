import requests
import os

from flask import redirect, render_template, session
from functools import wraps

WEIGHT_CONVERSION = {
    "g": 1,              # Gram
    "oz": 28.3495,       # Ounce
    "lb": 453.592,       # Pound
    "ml": 1,             # Milliliter (as 1g for water equivalence)
    "tsp": 4.92892,      # Teaspoon
    "tbsp": 14.7868,     # Tablespoon
    "cup": 240,          # Cup
    "pt": 473.176,       # Pint
    "qt": 946.353,       # Quart
    "pinch": 0.36,       # Pinch
}




def apology(message, code=400):
    """Render message as an apology to user."""

    return render_template("apology.html", err_number=code, err_message=(message)), code

def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function

