zkToken
================

Description
-----------
I am interested in zk-SNARKS and Smart Contracts after learning a bit about the theory I wanted to get some practical experience. So I decided to implement a Token that does not belong to an Ethereum address but to as specific hash. Tokens can only be spent if one knows the preimage of a the hash. In order to not reveal anything about the preimage the program uses zk-SNARKS, which are verified on chain using Zokrates. This means by using different addresses a user could potentially hide their identity.

Implementation
--------------
Research and Setup: I researched that Zokrates and Circom can be used to create zk-SNARKS and decided to go with zokrates, because the process seemed easier and there is an active community. First I researched how to implement a zk-SNARK for the knowledge of a preimage and which hash function to use. Even though SHA-256 is inefficient for zk-SNARKS because of the huge number of constraints in the circuit, I decided to go with it, because SHA-256 is supported in all major browsers and can be used on any strings. I also had to decide how to derive the hash from the user input, because the circuit requires fixed length inputs.

zk-SNARKS: I then wrote the circuit in the Zokrates DSL in `zokrates/knowledge_proof.zok` and used the zokrates-cli to compile it, generate the keys and create a verifier smart contract `contracts/verifier.sol`. Since the browser client generates the proof, which are verified on chain I then used zokrates-js, which is a bit different than the zokrates-cli. I wrote test cases for compilation, proving and verification in `test/knowledge_proof.js`. To use the generated contract `verifier.sol`, I had to migrate the solidity version to `^0.8.0` and then wrote test cases in `test/verfifier.js`. Note that the created contract contains the verification key and thus can only be used with the proving key `zokrates/proving.key`.

ZKToken: I then created the Token contract which uses this verifier and keeps track of the balances of all used hashes. The contract also needs to make sure that a proof cannot be used twice. So I added a nullifier to the zk-SNARK circuit, which is an input that binds a proof to a certain value. I used the number of outgoing transfers of a hash, which is incremented once a valid proof is submitted and thus makes the same proof unusable for the next transfer. At last I implemented events to notify the client and added minting functionality with role based access as with the BeerToken. Test cases for different transfer calls were implemented in `test/zktoken.js`.

Client: I used Angular together with Angular Material to create the client for the token. When loading the website, the zokrates WASM module needs to be initialized and then the zk-SNARK circuit is compiled at runtime from `assets/knowledge_proof.zok`. After initializing the user has to input a preimage with a minimum length of 5, which is then hashed with SHA-256 to create the secret. The secret is then again hashed with SHA-256 to get the public hash, which identifies the user in the ZKToken contract. These values are stored in localStorage, to keep a user "logged in". To transfer tokens the user has to input the account from which the transaction is created, the hash to which the tokens are sent and the number of tokens. Then the proof is computed in around 15s and the tokens are transfered. The UI should refresh without reloading the page.

Addresses
---------
Migrations: TBD

Verifier: TBD

ZKToken: TBD