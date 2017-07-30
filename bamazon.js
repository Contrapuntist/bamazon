var mysql = require('mysql');
var config = reqquire('./config.js');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: dbpass,
    database: 'bamazondb' 
});

connection.connect(function(err){ 
    if (err) throw err; 
    createProduct();
}); 

function createProduct() { 
    var query = connection.query( 
        'insert into products set ?',
        {
            product_name: 'shake weight',
            department_name: 'fitness',
            price: 19.99,
            stock_qty: 999
        },
        function(err, res) { 
            console.log(res);
        }
    )
connection.end();
}