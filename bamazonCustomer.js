var inquirer = require('inquirer');
var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection; 

var isShopping = {
    selectedProd: []
}

connection.connect(function(err){ 
    if (err) throw err; 
    askReadyToShop(); 
});  

// 1) show products
// 2) show two messages, one to choose the id and second to ask number of units 
// 3) check quantity to make sure product(s) selected are available.  if not enough available
//  then print 'insufficient quanity' and prevent order from completing
// 4) if store does have proper quanity, then fulfill order, which then requires updating 
//  database with new quanity amount and then show customer total cost of purchase. 
var productList = [];  





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

function shopperChoice() { 
    inquirer.prompt([
        {
            type: 'list',
            name: 'chooseProduct',
            message: "What would you like to buy?",
            choices: ['Item ID 1: Martin Acoustic Guitar', 'Item ID 4: Ernie Ball Strings', 'Item ID 6: Guitar Picks' ]
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
    return connection.end();
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
                console.log ('What you selected' + isShopping.selectedProd); 
            }
        }); 
    } else {
        console.log(Error('Something went wrong')); 
    }
}


function shopForWhat (list) { 
    console.log('shop for what?');
    connection.end(); 
    return new Promise(function (resolve, reject) {

    })
    
} 