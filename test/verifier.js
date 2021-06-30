// const Verifier = artifacts.require("Verifier");
// const proof = require("./proof.json");

// // These tests do not work with zktoken.js (It sucks when tests are not isolated)
// contract("Verifier", async (accounts) => {
//   let verifier;
//   // https://ethereum.stackexchange.com/questions/66710/before-all-hook-prepare-suite/69826
//   beforeEach("deploy", async () => {
//     verifier = await Verifier.new();
//   });

//   it("should be deployed correctly", async () => {
//     const balance = await web3.eth.getBalance(Verifier.address);
//     assert.equal(balance, 0);
//   });

//   it("Should verify valid proof", async () => {
//     const isValid = await verifier.verifyTx(
//       proof.proof.a,
//       proof.proof.b,
//       proof.proof.c,
//       proof.inputs
//     );
//     assert.equal(isValid, true);
//   });

//   it("Should not verify invalid proof", async () => {
//     proof.inputs[7] = proof.inputs[7].slice(0, -1) + "2"; // change timestamp
//     const isValid = await verifier.verifyTx(
//       proof.proof.a,
//       proof.proof.b,
//       proof.proof.c,
//       proof.inputs
//     );
//     assert.equal(isValid, false);
//   });
// });
