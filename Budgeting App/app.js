

//BUDGET CONTROLLER: Stores the data and manipulates it based on its categorization.
var budgetController = (function () {
    
    var Expense = function (id, description, value) { //the primary 3 values used in this app. id determines if it's an income or an expense, description adds a tag to that income or expense, such as 'vacation' or 'Christmas bonus', and 'value' is the numeric value of that income or expense. 'percentage' is also included at the end to determine percentage values with the default value of -1.
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function (totalIncome) { //determines percentage value
        
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function () { //This retreives the value calculated from the calculator written in line 69
        return this.percentage;
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) { //cur stands for 'current'
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    //var data will be used to aggregate all variables into one location, this is a good practice to develop when using multiple data structures.
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            
            
            //Create New ID: attaches an ID number to each item on the list. Needed to track and differentiate currently existing items from removed items.
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id+1;
            } else {
                ID = 0;
            }
            
            
            //Create New Item based on 'inc' or 'exp' type. 
            if (type === 'exp') {
               newItem = new Expense(ID, des, val); 
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //Push it into our data structure
            data.allItems[type].push(newItem);
            
            //return new element
            return newItem;
        },
        
        deleteItem: function (type, id) { //removes items from the list.
            var ids, index;
            
            ids = data.allItems[type].map(function (current) {
                
                return current.id;
            });
            
            index = ids.indexOf(id); //this redefines the current index to match the id of the element in question. In an example array of [1, 4, 7, 8], the '7' has an id of 7, but an index of 2. By making the idex match the ids, we can have a versatile function that adapts to the addition and removal of items on the list.
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1); //splice will remove items from the array with the format of splice(starting point, number of elements to remove)
            }
            
        },
        
        calculateBudget: function () {
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
               data.percentage = -1; 
            }
            
            
            
        },
        
        calculatePercentages: function () { //a packaged function to run the percentage calculation.
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);  //calcPercentage defined on line 13              
            });  
        },
        
        getPercentages: function () { //this grabs the percentage values
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage(); //getPercentage is defined on line 78
            });
            return allPerc;
          },
            
        
        getBudget: function () {
            return {
                budget : data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage                
            };
            
        },
        
        testing: function () {
            console.log(data);
        }
    };
    
})();

// UI CONTROLLER 
var UIController = (function () { //The controller responsible for all of the visual representation of the data presented from budgetController on line 4.
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    var formatNumber = function(num, type) { //this function reformats the data input by the user to have a '+' or '-' based on its categorization (income or expense), contain only 2 decimal places for the cent values, and have every 3rd number separated by commas to denote thousands.
        
            var numSplit, int, dec, type, sign;
                
            num = Math.abs(num);
            num = num.toFixed(2); //this determines to how many decimal places the value should be calculated at.
            
            numSplit = num.split('.'); //this splits the number into two parts: integer and decimal
            
            int = numSplit[0];
        
            if (int.length > 3) {
                int = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //adds a comma every 10^3 places.
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; //adds a '+' or a '-' depending on categorization.
        };
    
    var nodeListForEach = function(list, callback) { //an iteration function
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
    
    
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function (obj, type) {
            var html, newHtml, element;
            
            //Create HTML string with placeholder text, %id%, %description%, and %value%. 
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
                
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            
            
            //Replace placeholder text with actual data.
            newHtml = html.replace ('%id%', obj.id);
            newHtml = newHtml.replace ('%description%', obj.description);
            newHtml = newHtml.replace ('%value%', formatNumber (obj.value, type));
            
            //Insert HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function (selectorID) { //we cannot remove the parent in JS, only the child, so we first select the element by ID, go up to the parent node, then from there remove the child of that parent node by passing through that element again.
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function () { //clears the fields for description and value.
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); 
            
            fieldsArr = Array.prototype.slice.call (fields);
            
            fieldsArr.forEach(function (current, index, array){
                current.value = "";
                
            });
            
            fieldsArr[0].focus(); //sets the focus back to the object in question if it can be focused.
            
        },
        
        displayBudget: function(obj) { //Displays the corresponding amount to each category on the page
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            };
            
        },
        
        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) { //iterates through all expense values and assigns a percentage value to each based on total income amount. nodeListForEach defined on line 190.
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            })
        },
        
        displayMonth: function () {
            var now, month, year, months;
            
            now = new Date (); 
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function () { //adds either a red or a blue outline around the type, description, and value boxes depending on its categorization, red for expenses, blue for income.
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus');
                
            });
            
            document.querySelector (DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
    
})();




// GLOBAL APP CONTROLLER: serves as a channel between budgetController and UIController. It takes data from budgetController and properlly associates the corresponding visual to the UIController anddisplays it onscreen.

var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function (event) { //https://developer.mozilla.org/en-US/docs/Web/Events for referencing where to find specific event listeners. And http://keycodes.atjayjo.com/ to get a UI that displays all the keycodes for the keyboard.
        
            if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem ();
        };        
    });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function () {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function () {
        var input, newItem;
                
            // 1. Get the field input data
            input = UICtrl.getInput();
        
            if(input.description !== "" && !isNaN(input.value) && input.value > 0) { //this ensures the input value is a number, greater than zero and not blank.
        
            // 2. Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();
            
            // 5. Calculate and update the budget
            updateBudget();
            
            // 6. Calculate and update the percentages
            updatePercentages();
        }
        
        
    };
    
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update the percentages
            updatePercentages();
        }
        
    };
    
    
    return {
        init: function () { //defines the starting conditions of the app. 
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1                
            });
            setupEventListeners();
            
        }
    };
    
})(budgetController, UIController);

controller.init();






