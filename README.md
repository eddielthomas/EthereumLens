# EthereumLens

EthereumLens is an easy to use, decentralised (serverless) client for Ethereum based
block chains. Please feel free to use, abuse, fork and contribute!

EthereumLens is ideal for those learning about Ethereum block chains and developers
in particular who may be looking for examples of interacting with ethereum block chains via
the [Ethereum web3 api](https://github.com/ethereum/wiki/wiki/JavaScript-API).

#### Features

- Real time block chain statistics
- Account / transaction / block lookup
- Blockchain Transaction Audit & Analytics (Sender/Receiver)

#### Installation

- `git clone git@github.com:/eddielthomas/EthereumLens.git`
- `npm install`
- `npm start` will launch webpack in dev mode, you can browse to the project at localhost:8080

#### Usage

You will need the ability to make remote procedure calls (RPCs) to a block chain node: specifically you will
need a node which allows CORS access to your client.


- Running npm start will launch webpack's dev server on port 8000 which will conflict with the
default dapp port if your node is run with Parity (Geth has fewer config issues in my experience).


#### Limitations

The Ethereum Blockchain is a massively large data structure and with that said the Auditing Blockchain search feature should be limited to 5000 blocks at a time.  However, this application will allow you to search for more, just take in to consideration the number of request being made for each block to be processed.   This is an order of 3 api blockchain network calls: Get Block, Validate Transaction Addresses, Check if address is a contract.  

#### Contributing and forking

Contributors are more than welcome, please just submit a pull request.

Ethereum Explorer is released under the Apache license, feel free to re-use as you will!



