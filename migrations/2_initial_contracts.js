const Verifier = artifacts.require("Verifier");
const ZKToken = artifacts.require("ZKToken");

module.exports = function(deployer) {
  // https://ethereum.stackexchange.com/questions/18432/truffle-migrate-fails/21378
  deployer.then(async () => {
    await deployer.deploy(Verifier);
    await deployer.deploy(ZKToken, Verifier.address);
  })

};
