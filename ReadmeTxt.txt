create App in code use nextjs version 15, drizzle for postgresql Data Base in Neon, clerk for authorization

1. create project name InvoiceControl in Neon 

2. in Neon create table of Cuctomers with columns
    1) id
    2) name
    3) email
    4) createTS
3. in Neon create table of Invoices with columns
    1) id
    2) createTS
    3) value
    4) description
    5) customerId
    6) status 
    
    status can be :
    'open',
    'paid',
    'void',
    'uncollectible'

    customerId need to be id from Customers Table

4. create page  authorization by clerk

5. after authorization in browser go to page with Table of Invoices of the customers

   Table of Invoices with columns: 

   Date: date of create Invoices
   Customer: name of Customer
   Email: email of Customer
   Value: value of this Invoice
   Status: status of this invoice

  If click to data strip of invoice in the Table of Invoices, after click need open page of Invoice whith theire data

6. in page Invoice create drop menu for change invoice status

7. in  page with Table of Invoices create button Create Invoice

8. after press button Create Invoice go to page Create Invoice

9. in page Create Invoice create data entry fields
	 field Billing Name - entry Customer name
     field Email - entry customer email
     field Value - entry value of invoice
     field Description - entry of invoice description

    below  fields create button Submit - which do save data of invoice in Data Base 