var mysql = require('mysql');
var config = require('./config.js');
var connection = config.connection;


// var connection = mysql.createConnection({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: config.dbpass,
//     database: 'bamazondb' 
// });

connection.connect(function(err){ 
    if (err) throw err; 
    createProduct();
}); 

var mockData = [
    {
        product: 'Martin Acoustic Guitar',
        department: 'Guitars', 
        price: 1499.00, 
        stock: 35
    },
    {
        product: 'Les Paul Gibson SG Special Edition',
        department: 'Guitars', 
        price: 4499.99, 
        stock: 5
    },
    {
        product: 'Fender Stratocaster Guitar',
        department: 'Guitars', 
        price: 4000.00, 
        stock: 25
    },
    {
        product: 'Ernie Ball Guitar Strings',
        department: 'Guitar Accessories', 
        price: 10.99, 
        stock: 100
    },
    {
        product: 'Guitar Picking Exercises - Book 1 w/ MP3 Download',
        department: 'Sheet Music', 
        price: 19.99, 
        stock: 125
    },
    {
        product: 'Ernie Ball Guitar Picks (20 pack)',
        department: 'Accessories', 
        price: 4.99, 
        stock: 500
    },
    {
        product: 'Marshall Guitar Amplifier, 30"',
        department: 'Amplifiers', 
        price: 999.99, 
        stock: 125
    },
    {
        product: 'Electric Guitar Gig Bag',
        department: 'Guitars', 
        price: 59.99, 
        stock: 200
    },
    { 
        product: 'Dr. Beat Metronome',
        department: 'Accessories', 
        price: 89.99, 
        stock: 50
    },
    {
        product: 'Guitar Tuner',
        department: 'Accessories', 
        price: 14.99, 
        stock: 40
    },
]

function testloop(array) { 
    for (var i = 0; i < array.length; i++ ) {
        console.log('Product: ' + array[i].product + '\nDepartment: ' + array[i].department +'\nPrice: ' + array[i].price);
    } 
}

testloop(mockData); 

function createProduct() { 


    for (var i = 0; i < mockData.length; i++ ) {
        // console.log('Product: ' + array[i].product + '\nDepartment: ' + array[i].department +'\nPrice: ' + array[i].price);
        var query = connection.query( 
            'insert into products set ?',
            {
                product_name: mockData[i].product,
                department_name: mockData[i].department,
                price: mockData[i].price,
                stock_qty: mockData[i].stock
            },
            function(err, res) { 
                console.log(res);
            }
        )
    } 
connection.end();
}