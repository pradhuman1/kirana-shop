# kirana-shop

# Steps to run the repo

npm run dev
`http://localhost:8000/`

# Tutorial for setup

https://blog.logrocket.com/how-to-set-up-node-typescript-express/
https://blog.logrocket.com/configuring-nodemon-typescript/

# Mongodb Details

current plan at MongoDb Atlas -> M0 [Free ] limit is 512 MB

# Schema Details

business table would Containe infromation for business registered
{ "name":"business_name",email:"business@gmail.com","password":"business_password","type":"type_of_business","location":"location of business","address":"address of business"}

# User Journey for placing the order

- As soon as the user would log in to the app, his coordinates would be sent to the backend
- backend would look up in the business table for the nearest shop,and get the shop id
  Two approaches here
  Approach A
- Shop id will be looked in the inventory database and all the inventory of that particular shop will be shown
- Now as the customer chooses the product on UI, the shop ID as well as product id is sent to the backend
- This will be used to get the final pricing
- The concern is how it will be mapped for images

Approach B

- Create a global table for products.
- Now while adding products for the shop,just add product ids
- If while adding poduct is not found the product db,we will add it in product db and add its id in the db.

Approach A vs Approach B

- In approach A there would be differences in the pricing

Need to think again deeply all the case @Atishay Baid todo

# Product Db

{id:,name:"Parl G",imgUrl:"",price:"",commission:""}

# Inventory Db

{shopId:,id:"",productList:[{id,quantity,markUnAvaliable:false}],}

# Deleting a perticular index

`await Product.collection.dropIndex("imgUrl_1");`

# Schema variable naming convention

`camelCase` for models
