create database bamazondb;  
use bamazondb;

create table products ( 
	item_id int not null auto_increment,
    product_name varchar(100) null, 
    department_name varchar(100) null,
	price decimal (10, 2),
    stock_qty int, 
    primary key (item_id)
);
