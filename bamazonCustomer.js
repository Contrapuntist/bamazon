var inquirer = require('inquirer');
var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection; 
var productList = []; 
var shoppingObj = {
    cart: [],
    prodData: [],
    customerTotal: 0.00,
    counter: 0,
    shopDone: false
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
        shoppingObj.cart.push(response); 
        shopMore(); 

    }); 
}

function shopMore() { 
    console.log('reached shop more'); 
    
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
                // for (var i = 0; i < shoppingObj.cart.length; i++) { 
                //     console.log ('Selected Item: ' + shoppingObj.cart[i].product_name);
                // } 
                getStockData(shoppingObj.cart);
            }
        }); 
    
}

function getStockData (prods) {
    console.log("In get stock ... Product length is " + shoppingObj.cart.length);
    for (var i = 0; i < prods.length; i++) {
        prodID = prods[i].chooseProduct;
        prodqty = prods[i].productAmount;
        console.log('ID number: '+ prods[i].chooseProduct);        
        
        let search = 'SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id=' + prodID; 
        
        connection.query(search, function(err, res) { 
            console.log(res)
            stockint = res[0].stock_qty;
            console.log('Stock Quantity: ' + stockint);  
            if ( stockint > 0 ) { 
                console.log(`You are in luck, we have that item in stock`); 
                addToTotal(res, prodqty);
                orderCompleteCheck(prods.length);   
            } else { 
                notInStock(res); 
            } 
        })
    }
}

function addToTotal (data, userqty) {    

        var tally = data[0].price * userqty;
        shoppingObj.customerTotal += tally;
        console.log("Your total is: $" + shoppingObj.customerTotal); 
        updateStock(data, userqty).then(function(res, err) {
            // console.log('reached what comes after update stock');
            orderCompleteCheck() 
        }); 
}

function notInStock (data) {
        
        console.log(`We don't have enough of ${ data[0].product_name } in stock`); 
        console.log(`Your total is: $ ${ shoppingObj.customerTotal }`);  
}

function updateStock (data, userqty) { 
    return new Promise(function(resolve, reject) { 
        console.log('Time to update our stock after that purchase.');
        let newqty = data[0].stock_qty - userqty;
        let id = data[0].item_id;
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
                // console.log(res);
                resolve();
            }
        );
    
    })
} 

function orderCompleteCheck() {
    shoppingObj.counter++; 
    console.log('shopping counter: ' + shoppingObj.counter + "||  Item IDs in cart: " + shoppingObj.cart.length); 
    if (shoppingObj.counter === shoppingObj.cart.length) {
        shoppingObj.shopDone = true;
        completeOrder(shoppingObj.shopDone);  
    }
}   

function completeOrder (done) {
    console.log('Is order processing complete: ' + done);   
    if (done) { 
        console.log (`Thank you for shopping. Your total is $${ shoppingObj.customerTotal }`); 
        endConnect();   
    }
}

function endConnect () {  
    connection.end(); 
}