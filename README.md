# MyRecipes
#### Video Demo:  (https://www.youtube.com/watch?v=BPUL7Fwwrls)

## Description:

I decided to create a recipe webapp which allows you to create, manage and track recipes.
The app uses nutritional information from the United States Department of Agriculture (USDA)'s FoodData Central Database. It contains over 8000 food items implemented in my application to search and build recipes from.

### Key Features:
- Search for the nutritional information of individual ingredients
- Create your own recipes with dynamically-changing macros
- View created recipes and see the macros of different numbers of servings.
- Favourite recipes to save them to the homescreen.
- Delete recipes that are unwanted.

## Files

### ADDER_FOUNDATION.py and ADDER_SR_LEGACY.py

When I began this project I knew I wanted to use an API.

Initially I had intended to create a weather API-powered web application, but I felt that it wouldn't have been complex enough to become an entire project.
As a result, I decided to create an application which uses food nutrient information from USDA Food Data Central.
These files, ADDER_FOUNDATION and ADDER_SR_LEGACY, are Python scripts which use my API Key to pull info on foods from the USDA's Foundation Foods and SR Legacy Foods respectively.
I decided to use this approach because it meant I can insert the food data into a local database and then query from there, instead of fetching using API calls each time. This was due to the fact that API calls are limited to 1000 per hour, and also it is faster to query from my own database.

To write these scripts I used the Python requests library, as well as the python-dotenv library to store my API Key(s) in a .env file, instead of hard-coding it, and this also means I can change the API Key if ever necessary.

### app.py

app.py is the Python file containing my Flask code. It contains several routes.
Some of the code is adapted from my solution to Problem Set 9, such as the /login and /logout routes.
I used my knowledge of SQL mainly from Week 7 and partly from websites like W3Schools to create multiple tables in my database.
Most of them use foreign keys to reference other tables' columns,
and this means they all work in unison to provide a smooth experience for the user.
In app.py I leverage these tables to SELECT, INSERT or DELETE from different tables to help the user find ingredients and add, remove or modify recipes.
I had to learn how to use a new method from the flask library called 'jsonify' for this project,
which I used in conjunction with my JavaScript fetch() to retrieve information from the tables and dynamically add them to the database.
I also learned how to use request arguments, also part of JavaScript's fetch(), whereby I could request information from Flask without having to refresh the page using a GET or POST request.
Data Validation was crucial in this file, and I worked hard to ensure that the user can't input anything erroneous.

### helpertools.py

helpertools.py was inspired by Week 9 Finance's helpers.py - it contains some useful functions and information, such as a dictionary for converting between units which I
very descriptively named WEIGHT_CONVERSION. I also adapted the login_required wrapper function from Week 9, and created my own version of the apology().

I considered adding the ADDER_FOUNDATION and ADDER_SR_LEGACY scripts as functions or a singular function in helpertools.py, but ruled against it as the scripts only really have to run once.

### project.db

This is the Data Base file which stores all information such as foods, recipes, users, etc.

### main.js

In main.js I have a fairly large single function which contains the app's JavaScript. I had to learn a lot of new JavaScript functions and syntax for this project. One of the most
useful ones I learned about was fetch(), .then, .catch. You can use it to retrieve backend data without having to refresh the webpage by using URL request arguments. It proved extremely useful for pages such as Create Recipe and View Recipe, where I was dynamically providing information and changing
different elements on the webpage, such as the macro information.
I considered splitting the file into multiple smaller ones which would run whenever their parent .html document was opened, but it seemed unnecessary seeing as my Jinja made it so that every webpage was using the same basic layout where I had already added main.js.
A feature I was quite proud of was the 'autocomplete search results' - the user can search for part of a food's name, and the JavaScript will use fetch() to retrieve matches to the partial search, and dynamically display them as a
Google-search-like dropdown list. This can be filtered by Category as well. The user can click on the result they want to choose and it will auto-fill the remaining query.

### styles.css

This CSS file contains hundreds of lines of CSS to style the webpage in an aesthetically-pleasing manner, as well as ensuring a responsive webpage.
I chose to make the website look slightly different on larger and smaller screens - all of the different pages appear side-by-side on larger screens and on top of eachother on smaller screens, to prevent anything from becoming invisible or unreachable.
The majority of the styling was done with Bootstrap and this helped to make all the different pages seem consistent in their styling. Bootstrap was very helpful in constructing grids, using the row and col-* classes specfically. The table-responsive class was also
very useful for the homepage.

### /templates

/templates is the directory containing all the different .html files for each page of the app. Each uses Jinja to dynamically construct itself as part of layout.html.
The file layout.html contains its own Jinja to dynamically change the class name of the <body> tag in order to be able to provide a unique background and styling to each page. I did this
using a simple python statement inside the class="" of the body tag, which meant I could easily add the styling in styles.css later.

