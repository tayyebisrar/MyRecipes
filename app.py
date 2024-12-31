import os
import datetime
import json

from cs50 import SQL
from flask import Flask, redirect, render_template, jsonify, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpertools import apology, login_required, WEIGHT_CONVERSION

app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///project.db")

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/login", methods=["GET", "POST"])
def login():
    session.clear()
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)
        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))
        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)
        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        return redirect("/")
    else:
        return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "GET":
        return render_template("register.html")
    else:
        if not request.form.get("username"):
            return apology("must provide username", 400)
        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 400)
        elif not request.form.get("confirmation"):
            return apology("must confirm password", 400)
        if request.form.get("password") != request.form.get("confirmation"):
            return apology("password doesn't match confirmation", 400)

        try:
            hashpass = generate_password_hash(request.form.get("password"))
            db.execute("INSERT INTO users (username, hash) VALUES (?, ?) ",
                       request.form.get("username"), hashpass)
        except ValueError:
            return apology("username already in use", 400)

        return redirect("/login")

@app.route("/logout")
def logout():
    """Log user out"""
    # Forget any user_id
    session.clear()
    # Redirect user to login form
    return redirect("/")

@app.route("/")
@login_required
def index():
    headerdata = [["Name", 30], ["Kcal", 15], ["Carbs, g", 15], ["Protein, g", 15], ["Fats, g", 15], ["Serves", 10]]
    recentdata = db.execute("SELECT name, total_calories, total_carbohydrates, total_protein, total_fats, servings FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",session["user_id"])
    favouritedata = db.execute("SELECT name, total_calories, total_carbohydrates, total_protein, total_fats, servings FROM recipes JOIN favourite_recipes ON recipes.id = favourite_recipes.recipe_id WHERE favourite_recipes.user_id = ?", session["user_id"])
    favcount = len(favouritedata)
    return render_template("index.html", recentdata=recentdata, favouritedata=favouritedata, headerdata=headerdata, favcount=favcount)

@app.route("/search", methods=["GET", "POST"])
@login_required
def search():
    if request.args.get('searchQuery'):
        query = request.args.get('searchQuery')
        category = request.args.get('searchCategory', 'All')
        queries = query.split(' ')
        wordcount = len(queries)
        if wordcount > 1: # need to go more in detail for query
            sqlquerystr = "SELECT name FROM foods WHERE "
            for n in range(0, wordcount):
                if n == wordcount-1: # if it's the last word in the list
                    sqlquerystr = sqlquerystr + f"name LIKE '%{queries[n]}%'"
                else:
                    sqlquerystr = sqlquerystr + f"name LIKE '%{queries[n]}%' AND "
            if category == 'All':
                foods = db.execute(sqlquerystr)
            else:
                foods = db.execute(sqlquerystr + "AND category = ?", category)
        else:
            query_str = f"%{query}%"  # For LIKE query
            if category == 'All':
                foods = db.execute("SELECT name FROM foods WHERE name LIKE ?", query_str)
            else:
                foods = db.execute("SELECT name FROM foods WHERE name LIKE ? AND category = ?", query_str, category)
        return jsonify({"results": [{"name": food["name"]} for food in foods]})

    if request.method == "GET":
        ingredientcount = db.execute("SELECT COUNT(name) AS NAMECOUNT FROM foods")[0]['NAMECOUNT']
        categories = db.execute("SELECT DISTINCT(category) FROM foods")
        return render_template("search.html", ingredientcount=ingredientcount, categories=categories)
    else:
        categories = db.execute("SELECT DISTINCT(category) FROM foods")
        ingredient = request.form.get("ingredient")
        ingredientcount = db.execute("SELECT COUNT(name) AS NAMECOUNT FROM foods")[0]['NAMECOUNT']
        foodmacros = db.execute("SELECT * FROM foods WHERE name = ?", ingredient)
        if not foodmacros:
            return apology("Sorry, there is no ingredient with that name!", 400)
        else:
            foodmacros = foodmacros[0]
            return render_template("search.html", ingredientcount=ingredientcount, foodmacros=foodmacros, categories=categories)

@app.route("/createrecipe", methods=["GET", "POST"])
@login_required
def create_recipe():
    if request.args.get('searchQuery'):
        query = request.args.get('searchQuery')
        category = request.args.get('searchCategory', 'All')
        queries = query.split(' ')
        wordcount = len(queries)
        if wordcount > 1: # need to go more in detail for query
            sqlquerystr = "SELECT name FROM foods WHERE "
            for n in range(0, wordcount):
                if n == wordcount-1: # if it's the last word in the list
                    sqlquerystr = sqlquerystr + f"name LIKE '%{queries[n]}%'"
                else:
                    sqlquerystr = sqlquerystr + f"name LIKE '%{queries[n]}%' AND "
            if category == 'All':
                foods = db.execute(sqlquerystr)
            else:
                foods = db.execute(sqlquerystr + "AND category = ?", category)
        else:
            query_str = f"%{query}%"  # For LIKE query
            if category == 'All':
                foods = db.execute("SELECT name FROM foods WHERE name LIKE ?", query_str)
            else:
                foods = db.execute("SELECT name FROM foods WHERE name LIKE ? AND category = ?", query_str, category)
        return jsonify({"results": [{"name": food["name"]} for food in foods]})
    if request.args.get('ingredientName'):
        ingredient = request.args.get('ingredientName')
        weight = float(request.args.get('weight'))
        unit = request.args.get('weightUnit')
        foodmacros = db.execute("SELECT calories, carbohydrates, protein, fats, fdcId FROM foods WHERE name = ?", ingredient)
        if foodmacros:
            foodmacros=foodmacros[0]
            for macro in foodmacros:
                if macro != "fdcId":
                    foodmacros[str(macro)] /= 100
                    foodmacros[str(macro)] = foodmacros[str(macro)] * weight * WEIGHT_CONVERSION[unit]
                    foodmacros[str(macro)] = round(foodmacros[str(macro)], 2)
            return jsonify({"results": [{key:value} for key, value in foodmacros.items()]})
        else:
            return jsonify({"results": ["none"]})
    if request.method == "GET":
        recipecount = db.execute("SELECT COUNT(id) AS recipecount FROM recipes WHERE user_id = ?", session["user_id"])[0]['recipecount']
        ingredientcount = db.execute("SELECT COUNT(name) AS NAMECOUNT FROM foods")[0]['NAMECOUNT']
        categories = db.execute("SELECT DISTINCT(category) FROM foods")
        return render_template("createrecipe.html", ingredientcount=ingredientcount, categories=categories, recipecount=recipecount, WEIGHT_UNITS=WEIGHT_CONVERSION)
    else: # method == "POST"
        recipename = request.form.get('recipename')
        recipeinstructions = request.form.get('recipeinstructions')
        totalcalories = float(request.form.get('caloriesinput').replace('g', ''))
        totalcarbs = float(request.form.get('carbsinput').replace('g', ''))
        totalprotein = float(request.form.get('proteininput').replace('g', ''))
        totalfats = float(request.form.get('fatsinput').replace('g', ''))
        servings = int(request.form.get('servings'))
        timenow = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            ingredients = json.loads(request.form.get('ingredients'))
        except:
            return apology("No ingredients found in recipe", 400)

        db.execute('INSERT INTO recipes (user_id, name, description, total_calories, total_protein, total_carbohydrates, total_fats, servings, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', session["user_id"], recipename, recipeinstructions, totalcalories, totalprotein, totalcarbs, totalfats, servings, timenow)

        recipe_id = db.execute("SELECT MAX(id) AS id FROM recipes")[0]["id"]

        for ingredient in ingredients:
            db.execute("INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit) VALUES (?, ?, ?, ?)",
            recipe_id, ingredient['fdcId'], ingredient['weight'], ingredient['unit'])
        return redirect("/viewrecipe")

@app.route("/viewrecipe")
@login_required
def view_recipe():
    if request.args.get('viewAll'):
        all_recipes = db.execute('SELECT name FROM recipes WHERE user_id = ?', session["user_id"])
        return jsonify({"results": [{"name":recipe["name"]} for recipe in all_recipes]})
    if request.args.get('recipeQuery'):
        query = request.args.get('recipeQuery')
        queries = query.split(' ')
        finalquery = f"SELECT name FROM recipes WHERE user_id = {session["user_id"]}"
        for i in range(0, len(queries)):
            finalquery += f" AND name LIKE '%{queries[i]}%'"
        recipes = db.execute(finalquery)
        return jsonify({"results": [{"name":recipe["name"]} for recipe in recipes]})
    if request.args.get('recipeEntire'):
        recipe_name = request.args.get('recipeEntire')
        recipe_data = db.execute("SELECT name, description, total_calories, total_protein, total_carbohydrates, total_fats, servings, created_at, id FROM recipes WHERE name = ? AND user_id = ?", recipe_name, session["user_id"])
        if recipe_data:
            recipe_data = recipe_data[0]
            recipe_favourited = db.execute("SELECT recipe_id FROM favourite_recipes WHERE recipe_id = ? AND user_id = ?", recipe_data["id"], session["user_id"])
            if recipe_favourited:
                recipe_data['favourited'] = True
            else:
                recipe_data['favourited'] = False
            return jsonify({"results": [{key:value} for key, value in recipe_data.items()]})
        else:
            return jsonify({"results": ["none"]})
    if request.args.get('ingredientsFromRecipe'):
        recipeid = int(request.args.get('ingredientsFromRecipe'))
        ingredients = db.execute('SELECT food_id, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?', recipeid)
        for ingredient in ingredients:
            ingredient['name'] = db.execute('SELECT name FROM foods WHERE fdcId = ?', ingredient['food_id'])[0]['name']
        return jsonify({"ingredients":ingredients})
    if request.args.get('deleteRecipeId'):
        recipeId = int(request.args.get('deleteRecipeId'))
        try:
            db.execute('DELETE FROM favourite_recipes WHERE recipe_id = ?', recipeId)
            db.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', recipeId)
            db.execute('DELETE FROM recipes WHERE id = ? AND user_id = ?', recipeId, session["user_id"])
            return jsonify({"results":["success"]})
        except:
            return jsonify({"results":["invalid"]})
    if request.args.get('favouriteCheckId'):
        recipeId = int(request.args.get('favouriteCheckId'))
        favourited = db.execute('SELECT recipe_id FROM favourite_recipes WHERE recipe_id = ? AND user_id = ?', recipeId, session["user_id"])
        if favourited:
            db.execute('DELETE FROM favourite_recipes WHERE recipe_id = ? AND user_id = ?', recipeId, session["user_id"])
            return jsonify({"results":["unfavourited"]})
        else:
            db.execute('INSERT INTO favourite_recipes (user_id, recipe_id) VALUES (?, ?)', session["user_id"], recipeId)
            return jsonify({"results":["favourited"]})

    if request.method == "GET":
        recipe_count = db.execute("SELECT COUNT(id) AS recipecount FROM recipes WHERE user_id = ?", session["user_id"])[0]['recipecount']
        return render_template("viewrecipe.html", recipe_count=recipe_count)
