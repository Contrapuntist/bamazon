// Mid program, had to rethink logic and program to resolve connection ending issue. 
// created this backup file and code in case I needed to bring something I had previously created back into working file.


var inquirer = require('inquirer');
var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection; 
var productList = []; 
var isShopping = {
    selectedProd: [],
    customerTotal: 0.00
}
var prodID = null; 
var prodqty = null;
var stockint = null; 


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
                // checkInStock(isShopping.selectedProd, updateStock, completeOrder); 
                processOrder(checkInStock(isShopping.selectedProd, updateStock)).then(function(res, err) {
                    if (err) { 
                        throw err 
                    } else { 
                        completeOrder(endConnect) 
                    }  
                })
            }
        }); 
    } else {
        console.log(Error('Something went wrong')); 
    }
}

function processOrder(total, callback) { 
    console.log('Processing Order'); 
    return new Promise(function (resolve, reject) { 
        if (callback) {
            resolve(callback(total, updateStock)); 
        } else { 
            reject(Error('No callback function was passed')); 
        } 
    } 
)}

function checkInStock(prods, callback) { 
    for (var i = 0; i < prods.length; i++) { 

        console.log('ID number: '+ prods[i].chooseProduct);
        console.log('Quantity: ' + prods[i].productAmount);         
        
        prodID = prods[i].chooseProduct;
        prodqty = prods[i].productAmount; 
        let search = 'SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id=' + prodID; 
        
        connection.query(search, function(err, res) { 
            if (err) throw err;
            // console.log(res); 
            console.log(res[0].stock_qty); 
            stockint = res[0].stock_qty;  
            if (stockint - prodqty >= 0) { 
                console.log(`You are in luck, we have that item in stock`); 
                // connection.end(); 
                isShopping.customerTotal += (res[0].price * prodqty);
                console.log(`Your total is: $ ${isShopping.customerTotal}`); 
                callback( prodID, stockint, prodqty); 
            } else { 
                console.log(`We don't have enough of ${ res[0].product_name } in stock`); 
                console.log(`Your total is: $ ${ isShopping.customerTotal }`);
            }  
        })
    }
    // callback2( isShopping.customerTotal, endConnect);
}  

function updateStock (id, stock, prodqty) { 
    console.log('Time to update our stock after that purchase.');
    
    let newqty = stock - prodqty;
    connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_qty: newqty
      },
      {
        item_id: id
      }
    ],
    function(err, res) {
        console.log(res.affectedRows + " products updated!\n");
        // connection.end();

    }
  );    
} 

function completeOrder ( total, callback ) { 
    console.log (`Thank you for shopping. Your total is $${ total }`) 
    return callback();
}

function endConnect () { 
    // connection.end(); 
    console.log('want to end connection but javascfript ending early...  ')
}