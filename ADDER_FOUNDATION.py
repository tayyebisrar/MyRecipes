import requests
from dotenv import load_dotenv
import os
from cs50 import SQL

load_dotenv("stuff.env")
API_KEY = os.getenv("USDA_API_KEY")
foods = []
TOTAL_ENTRIES = 316
MAX_PAGE_SIZE = 100
DATA_TYPE = "Foundation"
db = SQL("sqlite:///project.db")

for x in range(1, (TOTAL_ENTRIES // MAX_PAGE_SIZE) + 2):
    url = f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={API_KEY}&dataType={DATA_TYPE}&pageSize={MAX_PAGE_SIZE}&pageNumber={x}'
    response = requests.get(url)
    data = response.json()

    for food in data['foods']:
        fdcId = food['fdcId']
        name = food['description']
        category = food['foodCategory']
        nutrients = {
            nutrient['nutrientName']: nutrient['value'] for nutrient in food['foodNutrients']
            if nutrient['nutrientName'] in ["Energy (Atwater General Factors)", "Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"]
            and ((nutrient['nutrientName'] != "Energy" and nutrient['nutrientName'] != "Energy (Atwater General Factors)") or nutrient['unitName'] == "KCAL")
        }
        try:
            try:
                calories = nutrients['Energy (Atwater General Factors)']
            except:
                calories = nutrients['Energy']
        except:
            continue

        protein = nutrients['Protein']
        carbohydrates = nutrients['Carbohydrate, by difference']
        fats = nutrients['Total lipid (fat)']
        foods.append({"fdcId":fdcId, "name":name, "category":category, "calories":calories, "protein":protein, "carbohydrates":carbohydrates, "fats":fats})

for food in foods:
    print(food)
    db.execute("INSERT OR IGNORE INTO foods (fdcId, name, category, calories, protein, carbohydrates, fats) VALUES (?, ?, ?, ?, ?, ?, ?)", food['fdcId'], food['name'], food['category'], food['calories'], food['protein'], food['carbohydrates'], food['fats'])
db.execute("DELETE FROM foods WHERE name LIKE '%&%'")
