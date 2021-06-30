const ZKToken = artifacts.require("ZKToken");
const Verifier = artifacts.require("Verifier");
const { assert } = require("chai");
const proof = require("./proof.json");
const truffleAssert = require('truffle-assertions');

contract("ZKToken", async (accounts) => {
  let zkToken;

  let minter = accounts[0];
  let anon1 = accounts[1];
  let anon2 = accounts[2];

  let anonIdentity1 =
    "0xa712efc9fbeb6298cdf94dc978587807808e80fbc1222fb957b1c13d510e983b";
  let anonIdentity2 =
    "0xb9a8c289be05460e2d3b81d8805f00a2eeac2702104455740ccdac59f80dc539";

  beforeEach("deploy and init", async () => {
    zkToken = await ZKToken.new(Verifier.address);
  });

  it("Should mint correctly", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });
    const balance = await zkToken.balanceOf(anonIdentity1);
    assert.equal(balance, 50, "anonIdentity1 should have 50 tokens");
    const supply = await zkToken.totalSupply();
    assert.equal(supply, 50);
  });

  it("Transfer with valid proof", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });

    let transferCount = await zkToken.transferCountOf(anonIdentity1);

    assert.equal(transferCount, 0, "transferCount should be 0 initially");

    await zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity2,
      20
    );

    const balance1 = await zkToken.balanceOf(anonIdentity1);
    const balance2 = await zkToken.balanceOf(anonIdentity2);

    assert.equal(balance1, 30, "anonIdentity1 should have 30 tokens");
    assert.equal(balance2, 20, "anonIdentity1 should have 20 tokens");

    transferCount = await zkToken.transferCountOf(anonIdentity1);

    assert.equal(transferCount, 1, "transferCount should be 1 after transfer");
  });

  it("Transfer to same idenity", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });

    await zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity1,
      20
    );

    const balance1 = await zkToken.balanceOf(anonIdentity1);
    assert.equal(balance1, 50, "anonIdentity1 should have 50 tokens");

    let transferCount = await zkToken.transferCountOf(anonIdentity1);
    assert.equal(transferCount, 1, "transferCount should be 1 after transfer");
  });

  it("Transfer with insufficient funds", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });

    truffleAssert.reverts(zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity2,
      60
    ));

    const balance1 = await zkToken.balanceOf(anonIdentity1);
    assert.equal(balance1, 50, "anonIdentity1 should have 50 tokens");

    let transferCount = await zkToken.transferCountOf(anonIdentity1);
    assert.equal(transferCount, 0, "transferCount should be 0 initially");
  });

  it("Transfer with same proof twice", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });

    await zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity2,
      10
    );

    truffleAssert.reverts(zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity2,
      10
    ));

  });

  it("Transfer twice with incremented countNullifier", async () => {
    await zkToken.mint(anonIdentity1, 50, { from: minter });

    await zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      proof.inputs,
      anonIdentity2,
      10
    );

    const newInputs = [...proof.inputs];
    newInputs[15] = "0x0000000000000000000000000000000000000000000000000000000000000002";

    truffleAssert.reverts(zkToken.transfer(
      proof.proof.a,
      proof.proof.b,
      proof.proof.c,
      newInputs,
      anonIdentity2,
      10
    ));
  });
});
