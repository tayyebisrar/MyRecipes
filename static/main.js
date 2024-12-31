if (!document.body.classList.contains("apologypage"))
{
    document.addEventListener('DOMContentLoaded', function () {
        if (document.body.classList.contains("searchpage"))
        {
            const categoryDropdownButton = document.getElementById('category-dropdown-button');
            const hiddenInputSelectedCategory = document.getElementById('selected-category');

            const foodSearch = document.getElementById('food-search-input');
            const dropdownMenu = document.getElementById('category-dropdown');
            const autocompleteResults = document.getElementById('autocomplete-results');

            window.selectCategory = function (category) {
                categoryDropdownButton.textContent = `Category: ${category}`;
                hiddenInputSelectedCategory.value = category;
                autocompleteResults.innerHTML = ''; // reset autocomplete
                foodSearch.dispatchEvent(new Event('input')); // trigger autocomplete update
            };

            foodSearch.addEventListener('input', function() {
                const searchQuery = foodSearch.value;
                const searchCategory = hiddenInputSelectedCategory.value;

                if (searchQuery.length < 1) {
                    autocompleteResults.style.display = 'none';
                    return;
                }

                fetch(`/search?searchQuery=${searchQuery}&searchCategory=${searchCategory}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Couldnt find data');
                        }
                        return response.json()
                    })
                    .then(data => {
                        autocompleteResults.innerHTML = ''; // clear autocomplete

                        if (data.results.length > 0) // if theres actually data
                        {
                            data.results.forEach(food => {
                                const a = document.createElement('a');
                                a.href = '#';
                                a.textContent = food.name;
                                a.classList.add('list-group-item');
                                a.classList.add('list-group-item-action');

                                a.addEventListener('click', function(event) {
                                    event.preventDefault();  // prevents default <a> navigation action
                                    foodSearch.value = food.name; // fill in suggestion
                                    autocompleteResults.style.display = 'none';  // hide autocomplete
                                });

                                autocompleteResults.appendChild(a);
                            });

                            autocompleteResults.style.display = 'block'; // show autocomplete
                        }
                        else // if theres no data
                        {
                            autocompleteResults.style.display = 'none'; // hide autocomplete
                        }
                    })
                    .catch(error => {
                        autocompleteResults.style.display = 'none'; // if user typed something wrong nothing happens
                    })
            });
        }


        if (document.body.classList.contains("viewrecipepage"))
            {

                const recipeSearch = document.getElementById('recipe-search-input');
                const autocompleteResults = document.getElementById('view-autocomplete-results');

                window.viewAllRecipes = function()
                {
                    autocompleteResults.innerHTML = ''; // clear autocomplete
                    recipeSearch.value = ''; // clear searchbar
                    fetch(`/viewrecipe?viewAll='true'`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Couldnt find data');
                            }
                            return response.json()
                        })
                        .then (data => {
                            autocompleteResults.innerHTML = ''; // clear autocomplete
                            if (data.results.length > 0)
                            {
                                data.results.forEach(recipe => {
                                    const a = document.createElement('a');
                                    a.href = '#';
                                    a.textContent = recipe.name;
                                    a.classList.add('list-group-item');
                                    a.classList.add('list-group-item-action');

                                    a.addEventListener('click', function(event) {
                                        event.preventDefault();
                                        recipeSearch.value = recipe.name;
                                        autocompleteResults.style.display = 'none';
                                    });

                                    autocompleteResults.appendChild(a);
                                });

                                autocompleteResults.style.display = 'block';
                            }
                            else
                            {
                                autocompleteResults.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            autocompleteResults.style.display = 'none';
                        })
                };

                recipeSearch.addEventListener('input', function() {
                    const recipeQuery = recipeSearch.value;

                    if (recipeQuery.length < 1)
                    {
                        autocompleteResults.style.display = 'none';
                        return;
                    }

                    fetch(`/viewrecipe?recipeQuery=${recipeQuery}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Couldnt find data');
                            }
                            return response.json()
                        })
                        .then (data => {
                            autocompleteResults.innerHTML = ''; // clear autocomplete

                            if (data.results.length > 0)
                            {
                                data.results.forEach(recipe => {
                                    const a = document.createElement('a');
                                    a.href = '#';
                                    a.textContent = recipe.name;
                                    a.classList.add('list-group-item');
                                    a.classList.add('list-group-item-action');

                                    a.addEventListener('click', function(event) {
                                        event.preventDefault();
                                        recipeSearch.value = recipe.name;
                                        autocompleteResults.style.display = 'none';
                                    });

                                    autocompleteResults.appendChild(a);
                                });

                                autocompleteResults.style.display = 'block';
                            }
                            else
                            {
                                autocompleteResults.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            autocompleteResults.style.display = 'none';
                        })
                });

                //

                const recipeName = document.getElementById('recipe-name-view');
                const servingsView = document.getElementById('servings');
                const recipeInstructions = document.getElementById('recipe-instructions');

                const caloriesValue = document.getElementById('caloriesvalue');
                const carbsValue = document.getElementById('carbsvalue');
                const proteinValue = document.getElementById('proteinvalue');
                const fatsValue = document.getElementById('fatsvalue');
                let maxCalories = 0.00;
                let maxCarbs = 0.00;
                let maxProtein = 0.00;
                let maxFats = 0.00;
                let maxServings = 0;
                let recipeId = 0;
                let recipeFavourited = false;

                const datetimeView = document.getElementById('datetimeView');

                const ingredientsList = document.getElementById('c-recipe-ingredient-results');

                const ingredientsBox = document.getElementById('ingredients-box');
                const macrosBox = document.getElementById('macros-box');

                const servingsChangerInput = document.getElementById('servings-changer');
                const favouriteButton = document.getElementById('fav-button');

                window.viewRecipe = function()
                {

                    const recipeQuery = recipeSearch.value;
                    ingredientsList.innerHTML = '';

                    fetch(`/viewrecipe?recipeEntire=${recipeQuery}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Couldnt find data');
                            }
                            return response.json()
                        })
                        .then (data => {
                            if (data.results == "none")
                            {
                                autocompleteResults.innerHTML = ''; // reset autocomplete
                                autocompleteResults.style.display = 'none'; // hide it
                                recipeSearch.value = 'Invalid Recipe Name!';
                                return;
                            }
                            autocompleteResults.innerHTML = ''; // clear autocomplete
                            recipeName.value = data.results[0].name;
                            recipeInstructions.value = data.results[1].description;
                            caloriesValue.textContent = data.results[2].total_calories;
                            carbsValue.textContent = data.results[4].total_carbohydrates;
                            proteinValue.textContent = data.results[3].total_protein;
                            fatsValue.textContent = data.results[5].total_fats;
                            servingsView.value = data.results[6].servings;
                            datetimeView.textContent = data.results[7].created_at;

                            recipeId = data.results[8].id;
                            recipeFavourited = data.results[9].favourited;

                            maxCalories = data.results[2].total_calories;
                            maxCarbs = data.results[4].total_carbohydrates;
                            maxProtein = data.results[3].total_protein;
                            maxFats = data.results[5].total_fats;
                            maxServings = parseInt(data.results[6].servings);

                            fetch(`/viewrecipe?ingredientsFromRecipe=${recipeId}`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Couldnt find data');
                                    }
                                    return response.json()
                                })
                                .then (data => {
                                    data.ingredients.forEach(ingredient => {
                                        const ingredient_name = ingredient.name;
                                        const weight = ingredient.quantity;
                                        const weight_unit = ingredient.unit;

                                        const div = document.createElement('div');
                                        div.classList.add('ingredient-list-ingredient-div');

                                        const a = document.createElement('a');
                                        a.classList.add('ingredient-list-ingredient-a');

                                        if (ingredient_name.length > 70)
                                        {
                                            a.textContent = ingredient_name.substring(0, 67) + '...';
                                        }
                                        else
                                        {
                                            a.textContent = ingredient_name;
                                        }
                                        a.innerHTML = a.textContent +' - <b>'+ weight + weight_unit + '</b>';
                                        div.appendChild(a);
                                        ingredientsList.appendChild(div);
                                    });
                                    servingsChangerInput.disabled = false;
                                    ingredientsBox.classList.remove("disabled");
                                    macrosBox.classList.remove("disabled");
                                    servingsChangerInput.value = maxServings;

                                    if (recipeFavourited)
                                    {
                                        favouriteButton.textContent = '★';
                                    }
                                    else
                                    {
                                        favouriteButton.textContent = '☆';
                                    }

                                })
                                .catch(error => {
                                    autocompleteResults.style.display = 'none';
                                    autocompleteResults.innerHTML = ''; // reset autocomplete
                                    console.error("Error:", error);
                                    recipeSearch.value = 'An error has occured while finding ingredients!';
                                })
                        })
                        .catch(error => {
                            autocompleteResults.style.display = 'none';
                            autocompleteResults.innerHTML = ''; // reset autocomplete
                            recipeSearch.value = 'Invalid Recipe Name!';
                            return;
                        })

                };

                servingsChangerInput.addEventListener('input', function(event) {
                    servingsChangerInput.value = servingsChangerInput.value.replace(/\D/g , '')
                    let servings = servingsChangerInput.value.trim();
                    if (servings === "")
                    {
                        servings = maxServings;
                    }
                    else
                    {
                        servings = parseInt(servings);
                    }

                    if (servings == 0)
                    {
                        caloriesValue.textContent = '0.00';
                        carbsValue.textContent = '0.00';
                        proteinValue.textContent = '0.00';
                        fatsValue.textContent = '0.00';
                    }
                    else if (servings > maxServings)
                    {
                        servings = maxServings;
                        servingsChangerInput.value = maxServings;
                    }
                    else
                    {
                        caloriesValue.textContent = ((servings / maxServings) * maxCalories).toFixed(2);
                        carbsValue.textContent = ((servings / maxServings) * maxCarbs).toFixed(2);
                        proteinValue.textContent = ((servings / maxServings) * maxProtein).toFixed(2);
                        fatsValue.textContent = ((servings / maxServings) * maxFats).toFixed(2);
                    }
                });

                window.deleteRecipe = function() {
                    if (recipeId == 0)
                    {
                        return;
                    }
                    fetch(`/viewrecipe?deleteRecipeId=${recipeId}`)
                        .then(response=> {
                            if (!response.ok)
                            {
                                throw new Error("Couldn't delete recipe");
                            }
                            return response.json()
                        })
                        .then(data => {
                            if (data.results[0] == "success")
                            {
                                location.reload();
                                return;
                            }
                            recipeSearch.value = "Error! Can't delete empty recipe!";
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            recipeSearch.value = "Error! Couldn't delete recipe!";
                        })
                };

                window.favouriteRecipe = function() {
                    if (recipeId == 0)
                    {
                        return;
                    }
                    fetch(`/viewrecipe?favouriteCheckId=${recipeId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Can't find favourites");
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.results[0] == "favourited")
                            {
                                recipeFavourited = true;
                                favouriteButton.textContent = '★';
                            }
                            if (data.results[0] == "unfavourited")
                            {
                                recipeFavourited = false;
                                favouriteButton.textContent = '☆';
                            }
                        })
                        .catch(error => {
                            console.error("Error: ", error);
                            return;
                        })
                };
            }


            if (document.body.classList.contains("createrecipepage"))
                {
                    const categoryDropdownButton = document.getElementById('category-dropdown-button');
                    const hiddenInputSelectedCategory = document.getElementById('selected-category');

                    const foodSearch = document.getElementById('food-search-input');
                    const dropdownMenu = document.getElementById('category-dropdown');
                    const autocompleteResults = document.getElementById('recipe-autocomplete-results');

                    window.selectCategory = function (category) {
                        categoryDropdownButton.textContent = `Category: ${category}`;
                        hiddenInputSelectedCategory.value = category;
                        autocompleteResults.innerHTML = ''; // reset autocomplete
                        foodSearch.dispatchEvent(new Event('input')); // trigger autocomplete update
                    };

                    foodSearch.addEventListener('input', function() {
                        const searchQuery = foodSearch.value;
                        const searchCategory = hiddenInputSelectedCategory.value;

                        if (searchQuery.length < 1) {
                            autocompleteResults.style.display = 'none';
                            return;
                        }

                        fetch(`/createrecipe?searchQuery=${searchQuery}&searchCategory=${searchCategory}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Couldnt find data');
                                }
                                return response.json()
                            })
                            .then(data => {
                                autocompleteResults.innerHTML = ''; // clear autocomplete

                                if (data.results.length > 0) // if theres actually data
                                {
                                    data.results.forEach(food => {
                                        const a = document.createElement('a');
                                        a.href = '#';
                                        a.textContent = food.name;
                                        a.classList.add('list-group-item');
                                        a.classList.add('list-group-item-action');

                                        a.addEventListener('click', function(event) {
                                            event.preventDefault();  // prevents default <a> navigation action
                                            foodSearch.value = food.name; // fill in suggestion
                                            autocompleteResults.style.display = 'none';  // hide autocomplete
                                        });

                                        autocompleteResults.appendChild(a);
                                    });

                                    autocompleteResults.style.display = 'block'; // show autocomplete
                                }
                                else // if theres no data
                                {
                                    autocompleteResults.style.display = 'none'; // hide autocomplete
                                }
                            })
                            .catch(error => {
                                autocompleteResults.style.display = 'none'; // if user typed something wrong nothing happens
                            })
                    });

                    //

                    const ingredientWeightInput = document.getElementById('ingredient-weight-input');
                    const ingredientUnitSelect = document.getElementById('weightunits');
                    const ingredientsList = document.getElementById('c-recipe-ingredient-results');

                    const caloriesValue = document.getElementById('caloriesvalue');
                    const carbsValue = document.getElementById('carbsvalue');
                    const proteinValue = document.getElementById('proteinvalue');
                    const fatsValue = document.getElementById('fatsvalue');

                    const caloriesInput = document.getElementById('calories-input');
                    const carbsInput = document.getElementById('carbs-input');
                    const proteinInput = document.getElementById('protein-input');
                    const fatsInput = document.getElementById('fats-input');

                    const ingredientsJsonInput = document.getElementById('ingredients-list-json');

                    const recipeInstructionsTextArea = document.getElementById('recipe-instructions');
                    const servingsInput = document.getElementById('servings');

                    recipeInstructionsTextArea.textContent = '';

                    servingsInput.addEventListener('input', function(event) {
                        servingsInput.value = servingsInput.value.replace(/\D/g , '')
                    });
                    ingredientWeightInput.addEventListener("input", function(event) {
                        const input = event.target;
                        const validPattern = /^\d*(\.\d*)?$/; // Matches numbers with optional decimals
                        const value = input.value;

                        // Prevent starting with a decimal point
                        if (value.startsWith(".")) {
                            input.value = ""; // Clear the invalid input
                            return;
                        }

                        // Validate the entire input
                        if (!validPattern.test(value)) {
                            input.value = value.slice(0, -1); // Remove the last invalid character
                        }
                    });


                    function updateIngredientsInput()
                    {
                        const ingredients = [];
                        const ingredientsDivList = document.querySelectorAll('.ingredient-list-ingredient-div')

                        ingredientsDivList.forEach((div) => {
                            const divtext = div.querySelector('a').textContent;
                            const final_dash_index = divtext.lastIndexOf(' - ');
                            const ingredient = divtext.substring(0, final_dash_index);
                            const ingredientUnits = divtext.substring(final_dash_index + 3);

                            const weight = ingredientUnits.match(/(\d+(\.\d+)?)/)[0]; // Adapted from Assistive AI
                            const unit = ingredientUnits.match(/([a-zA-Z]+)/)[0]; // Adapted from Assistive AI

                            const fdcId = div.querySelector('input').value;
                            ingredients.push({
                                name: ingredient.trim(), // Remove trailing spaces
                                fdcId: fdcId.trim(), // fdcId
                                weight: parseFloat(weight),
                                unit: unit.trim()
                            });

                            ingredientsJsonInput.value = JSON.stringify(ingredients);
                        });
                    }

                    function changeIngredientMacros(calories, carbs, protein, fats, status)
                    {

                        /* was previously
                        caloriesValue.textContent = (parseFloat(caloriesValue.textContent) + calories).toFixed(2);
                        carbsValue.textContent = (parseFloat(carbsValue.textContent) + carbs).toFixed(2);
                        proteinValue.textContent = (parseFloat(proteinValue.textContent) + protein).toFixed(2);
                        fatsValue.textContent = (parseFloat(fatsValue.textContent) + fats).toFixed(2);
                        */

                        let newCalories = (parseFloat(caloriesValue.textContent) + calories);
                        let newCarbs = (parseFloat(carbsValue.textContent) + carbs);
                        let newProtein = (parseFloat(proteinValue.textContent) + protein);
                        let newFats = (parseFloat(fatsValue.textContent) + fats);

                        if (newCalories < 0)
                        {
                            newCalories = 0.00;
                        }
                        if (newCarbs < 0)
                        {
                            newCarbs = 0.00;
                        }
                        if (newProtein < 0)
                        {
                            newProtein = 0.00;
                        }
                        if (newFats < 0)
                        {
                            newFats = 0.00;
                        }
                        caloriesValue.textContent = newCalories.toFixed(2);
                        carbsValue.textContent = newCarbs.toFixed(2);
                        proteinValue.textContent = newProtein.toFixed(2);
                        fatsValue.textContent = newFats.toFixed(2);

                        if (ingredientsList.childNodes.length == 4 && status == "Remove")
                        {
                            caloriesValue.textContent = '0.00';
                            carbsValue.textContent = '0.00';
                            proteinValue.textContent = '0.00';
                            fatsValue.textContent = '0.00';
                        }

                        caloriesInput.value = caloriesValue.textContent;
                        carbsInput.value = carbsValue.textContent;
                        proteinInput.value = proteinValue.textContent;
                        fatsInput.value = fatsValue.textContent;
                    }

                    window.AddIngredient = function()
                    {
                        const weight = ingredientWeightInput.value;
                        const weight_unit = ingredientUnitSelect.value;
                        const ingredient_name = foodSearch.value;

                        autocompleteResults.innerHTML = ''; // reset autocomplete
                        autocompleteResults.style.display = 'none'; // hide it

                        if (!weight || !weight_unit || !ingredient_name)
                        {
                            return;
                        }

                        if ((parseFloat(weight)) > 100000)
                        {
                            ingredientWeightInput.value = "Weight Too High!";
                            return;
                        }

                        fetch(`/createrecipe?ingredientName=${ingredient_name}&weight=${weight}&weightUnit=${weight_unit}`)
                            .then(response => {
                                if (!response.ok)
                                {
                                    throw new Error(`Couldn't find data!`);
                                }
                                return response.json()
                            })
                            .then (data => {
                                // if data is actually received
                                if (data.results == "none")
                                {
                                    autocompleteResults.innerHTML = ''; // reset autocomplete
                                    autocompleteResults.style.display = 'none'; // hide it
                                    foodSearch.value = 'Error! Invalid ingredient!';
                                    return;
                                }

                                // if data is correct, i.e. a valid ingredient
                                const ingredient_calories = data.results[0].calories;
                                const ingredient_carbohydrates = data.results[1].carbohydrates;
                                const ingredient_protein = data.results[2].protein;
                                const ingredient_fats = data.results[3].fats;
                                // store the food id
                                const fdcIdInput = document.createElement('input');
                                fdcIdInput.type = 'hidden';
                                fdcIdInput.value = data.results[4].fdcId;

                                // add it to the ingredients list
                                const div = document.createElement('div');
                                div.classList.add('ingredient-list-ingredient-div');

                                const a = document.createElement('a');
                                a.classList.add('ingredient-list-ingredient-a');
                                a.href = '#';

                                if (ingredient_name.length > 70)
                                {
                                    a.textContent = ingredient_name.substring(0, 67) + '...';
                                }
                                else
                                {
                                    a.textContent = ingredient_name;
                                }
                                a.innerHTML = a.textContent +' - <b>'+ weight + weight_unit + '</b>';
                                changeIngredientMacros(ingredient_calories, ingredient_carbohydrates, ingredient_protein, ingredient_fats, 'Add');

                                a.addEventListener('click', function(event) {
                                    event.preventDefault();  // prevents default <a> navigation action
                                    // remove it from the macros
                                    changeIngredientMacros(-ingredient_calories, -ingredient_carbohydrates, -ingredient_protein, -ingredient_fats, 'Remove');
                                    // remove the ingredient
                                    div.remove()
                                    updateIngredientsInput();
                                });

                                div.appendChild(fdcIdInput);
                                div.appendChild(a);
                                ingredientsList.appendChild(div);
                                updateIngredientsInput();
                            })
                            .catch(error => {
                                autocompleteResults.innerHTML = ''; // reset autocomplete
                                autocompleteResults.style.display = 'none'; // hide it
                                foodSearch.value = 'Error! Invalid ingredient!';
                            })
                    };
                }
    });
}


