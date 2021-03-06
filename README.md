# Bamazon 

## Overview 

Node-based shopping app, which allows users to select more than on product and the quantity for each. At the start of the app, a list of available prodiucts with item ID, product name, and process is diplayed and a prompt appears asking the user to confirm they are ready to shop. If yes, app progresses to next step. if not then the app displays a message of disappointing. 

Upon confirmation of "ready to shop", then a prompt is shown displaying item IDs to choose from and the quanity for that item. The user is then shown another prompt to confirm they are done shopping. If they user is not done, the shopping selection sequence repeats.     

Once the user completes shopping, then a series of actions occur, which are automated. Make shopping experience more fluid to process all products at once instead of after each selection.   

1. Confirms the items selected are in stock 
2. if in stock, then adds up price * quantity otherwise, will send a message the item is not available and another message with existing total. 
3. then will update product stock in database 
4. once all the products have been checked and the total tallied, a final order total is displayed and the app ends by ending connection with database.  


# Steps with screenshots 

## Step 1 - Ready to Shop Prompt

![Step 1](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step1.PNG)

## Step 2 - After yes, Select Item

![Step 2 - select item](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step2-yes.PNG)

## Step 3 - Enter quantity 

![Step 3 - select quanity](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step3-qty.PNG)

## Step 4 - Done shopping? prompt

![Step 4 - Done shopping prompt](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step4-doneshoppingprompt.PNG)

## Step 5 - Continue shopping (optional)

![Step 5 - More Shopping Prompt](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step5-moreshoppingprompt.PNG)  

## Step 6 - Order processed: check stock and tally total

![Step 6 - Order processed: check stock and tally total](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step6-ProcessOrderandUpdateStockAutomated.PNG)

## Step 7 - Datbase updates and database connection ends 

![Step 7 - Logs product items updates in database](https://github.com/Contrapuntist/bamazon/blob/master/images/Bamazon-Step7-DatabaseUpdateconfirm.PNG)