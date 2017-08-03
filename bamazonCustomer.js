var inquirer = require('inquirer');
var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection; 
var productList = []; 
var isShopping = {
    selectedProd: []
}

connection.connect(function(err){ 
    if (err) throw err; 
    getProductList();
    // askReadyToShop();

});  

// 1) show products
// 2) show two messages, one to choose the id and second to ask number of units 
// 3) check quantity to make sure product(s) selected are available.  if not enough available
//  then print 'insufficient quanity' and prevent order from completing
// 4) if store does have proper quanity, then fulfill order, which then requires updating 
//  database with new quanity amount and then show customer total cost of purchase. 
 

var askReadyToShop = function () { 
    inquirer.prompt([ 
        {
            type: 'rawlist',
            name: 'readytoshop',
            message: 'Are you ready to shop?',
            choices: ['yes', 'no']
        }
    ]).then(function(answers) {
        console.log(answers);
        if (answers.readytoshop === 'yes') { 
            console.log('is ready to shop'); 
            showProductList();  
        } else { 
            console.log("Perhaps next time. Come back and see us soon!"); 
        }
    });
} 

// ['Item ID 1: Martin Acoustic Guitar', 'Item ID 4: Ernie Ball Strings', 'Item ID 6: Guitar Picks' ]

function shopperChoice() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'chooseProduct',
            message: "What would you like to buy?",
            choices: productList
        },
        {
            type: 'input',
            name: 'productAmount',
            message: 'How many would you like to buy?' 
        }
    ]).then(function(response) {
        console.log(response);
        isShopping.selectedProd.push(response); 
        shopMore(response); 

    }); 
}

function getProductList() { 
    console.log('Here is what\'s available');
    let query = connection.query(
        'select * from products',
        function (err, res) {
            for (var i = 0; i < res.length; i++ ) {
                productList.push(res[i]);
                console.log("Item ID: " + res[i].item_id + '  || Name: ' + res[i].product_name + '  || Price: ' + res[i].price); 
            } 
        askReadyToShop(); 
        }
    )
} 

function showProductList() { 
    console.log('Here is what\'s available');
    let query = connection.query(
        'select * from products',
        function (err, res) {
            for (var i = 0; i < res.length; i++ ) {
                productList.push(res[i]);
                console.log("Item ID: " + res[i].item_id + '  || Name: ' + res[i].product_name + '  || Price: ' + res[i].price); 
            }
        return shopperChoice();
        }
    )
} 

function shopMore(res) { 
    if (res) { 
        inquirer.prompt([
            {
                type: 'list',
                name: 'shopmore',
                message: 'Done shopping?',
                choices: ['Yes', 'No'] 
            }
        ]).then(function(answers) { 
            if (answers.shopmore === "No") {
                shopperChoice();
            } else { 
                for (var i = 0; i < isShopping.selectedProd.lenth; i++) { 
                    console.log ('Selected Item: ' + isShopping.selectedProd[i]);
                } 
                checkInStock(isShopping.selectedProd); 
            }
        }); 
    } else {
        console.log(Error('Something went wrong')); 
    }
}

//   connection.query("SELECT * FROM products", function(err, res) {
//     if (err) throw err;
//     // Log all results of the SELECT statement
//     console.log(res);
//     connection.end();
//   });

function checkInStock(prods) {
    
    console.log(prods.length);
    var prodID = 1;
    var prodqty = 1; 
    let search = 'SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id=' + prodID; 
    connection.query(search, function(err, res) { 
        // if (err) throw err;
        console.log(res); 
        console.log(res[0].stock_qty); 
        var stockint = res[0].stock_qty;  
        if (stockint - prodqty >= 0) { 
            console.log(`You are in luck, we have that item in stock`); 
            connection.end(); 
        } else { 
            console.log(`We don't have enough in stock`); 
        }
    })
} 