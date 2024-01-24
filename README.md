To run the app first start the ganache server 
ganche-cli 

Then deploy the contracts using truffle 
truffle migrate --network development 

To deploy on sepolia testnet 
truffle migrate --network sepolia

Then start the react app by moving to client folder 
cd client 
npm start
