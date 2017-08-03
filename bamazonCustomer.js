var inquirer = require('inquirer');
var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection; 
var productList = []; 
var isShopping = {
    selectedProd: [],
    customerTotal: 0.00
}

connection.connect(function(err){ 
    if (err) throw err; 
    getProductList();
    // askReadyToShop();

});  

function getProductList() { 
    console.log('Here is what\'s available');
    let query = connection.query(
        'select * from products',
        function (err, res) {
            for (var i = 0; i < res.length; i++ ) {
                productList.push(res[i].item_id.toString());
                console.log("Item ID: " + res[i].item_id + '  || Name: ' + res[i].product_name + '  || Price: ' + res[i].price); 
            } 
        askReadyToShop(); 
        }
    )
} 

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
            shopperChoice(productList)  
        } else { 
            console.log("Perhaps next time. Come back and see us soon!"); 
        }
    });
} 

// ['Item ID 1: Martin Acoustic Guitar', 'Item ID 4: Ernie Ball Strings', 'Item ID 6: Guitar Picks' ]

function showProductList(callback) { 
    console.log('Here is what\'s available');
    console.log(productList);
    connection.query(
        'select * from products',
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++ ) {
                console.log("Item ID: " + res[i].item_id + '  || Name: ' + res[i].product_name + '  || Price: ' + res[i].price); 
            }
        }
    ) 
    callback(productList);
} 

function shopperChoice (prodlist) {
    console.log("reached shopper choice");
    console.log(productList);  
    inquirer.prompt([
        {
            type: 'list',
            name: 'chooseProduct',
            message: "What would you like to buy?",
            choices: prodlist
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


function shopMore(res) { 
    console.log('reached shop more'); 
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
                shopperChoice(productList); 
            } else { 
                for (var i = 0; i < isShopping.selectedProd.lenth; i++) { 
                    console.log ('Selected Item: ' + isShopping.selectedProd[i]);
                } 
                checkInStock(isShopping.selectedProd, updateStock); 
            }
        }); 
    } else {
        console.log('Something went wrong'); 
    }
}

//   connection.query("SELECT * FROM products", function(err, res) {
//     if (err) throw err;
//     // Log all results of the SELECT statement
//     console.log(res);
//     connection.end();
//   });

function checkInStock(prods, callback) {
    for (var i = 0; i < prods.length; i++) { 

        console.log('ID number: '+ prods[i].chooseProduct);
        console.log('Quantity: ' + prods[i].productAmount);         
        
        let prodID = prods[i].chooseProduct;
        let prodqty = prods[i].productAmount; 
        let search = 'SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id=' + prodID; 
        
        connection.query(search, function(err, res) { 
            // if (err) throw err;
            console.log(res); 
            console.log(res[0].stock_qty); 
            var stockint = res[0].stock_qty;  
            if (stockint - prodqty >= 0) { 
                console.log(`You are in luck, we have that item in stock`); 
                // connection.end(); 
                isShopping.customerTotal += (res[0].price * prodqty);
                console.log(`Your total is: $ ${isShopping.customerTotal}`); 
            } else { 
                console.log(`We don't have enough of ${ res[0].product_name } in stock`); 
                console.log(`Your total is: $ ${ isShopping.customerTotal }`);
            }
        })
        
        callback(); 
    }
}  

var updateStock = function () { 
    console.log('Time to update our stock after that purchase.');
    connection.end();
} 