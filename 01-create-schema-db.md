

1. For  data base create table of Cuctomers with columns
    1) id
    2) name
    3) email
    4) createTS

2. For  data base create of Invoices with columns
    1) id
    2) createTS
    3) value - contains no more than two digits after the comma or dot and rounded to the second decimal place and this value is entered into the database
    4) description
    5) customerId
    6) status 
    
    Where 
    a) status can be :
    'open',
    'paid',
    'void',
    'uncollectible'

    b) customerId need to be id from Customers Table