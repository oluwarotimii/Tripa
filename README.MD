//CREATE NEW WALLETS ENDPOINTS NEED TO BE REVISTED
//CHECK WALLET BALANCE ENPOINT NEEDS TO BE REVISTED



//USER LOGIN DONE
//USER CONTROLLER DONE

//MOST BUS CARDS ENPOINTS FUNTIONING WELL


//WALLET CONTROLLER

for testing the traansfer fund feature this  details were used in Raw Body
{
  "account_reference": "PSA3B6F877C205106910",
  "amount": "1000",
  "currency": "NGN",
  "paymentType": "bank_transfer",
  "email": "example@example.com"
}


FETCH THE VIRTUAL ACCOUNT
 endpoint  example :http://localhost:4000/payout-subaccounts/PSA3B6F877C205106910/static-account?currency=NGN

 FETHCH BALANCE: http://localhost:4000/wallets/PSA3B6F877C205106910/balance (example)