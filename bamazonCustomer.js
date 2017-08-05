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
                return checkInStock(isShopping.selectedProd, updateStock).then(function(){
                    // console.log(response); 
                    completeOrder(isShopping.customerTotal); 
                    })   
            }
        }); 
    } else {
        console.log(Error('Something went wrong')); 
    }
}

function checkInStock(prods, callback) { 
    return new Promise (function (resolve, reject) { 
        for (var i = 0; i < prods.length; i++) { 
            console.log('ID number: '+ prods[i].chooseProduct);
            console.log('Quantity: ' + prods[i].productAmount);         
            
            prodID = prods[i].chooseProduct;
            prodqty = prods[i].productAmount; 
            let search = 'SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id=' + prodID; 
            
            connection.query(search, function(err, res) { 
                if (err) {
                    reject(err) 
                } else { 
                    resolve(sqlCheck(res, updateStock))
                }
            })
        }  
    })
}
 
function sqlCheck (res, callback) { 
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
        console.log(res);
        // console.log(res.affectedRows + " products updated!\n");
        // connection.end();
    }
  );
} 

// var completeOrder = Promise.resolve(`Thank you for shopping. Your total is $${ isShopping.customerTotal }`);

var completeOrder = function (total) { 
    return new Promise (function (resolve, reject) { 
        if (total) { 
            console.log (`Thank you for shopping. Your total is $${ total }`); 
            endConnect(); 
        } else {
            reject('Error occurred'); 
        }
    });  
};

function endConnect () {  
    connection.end(); 
    console.log('do we have an async issue?')
}