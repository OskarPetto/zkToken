const witnessInputs = require("./witness_inputs.json");
const { initialize } = require("zokrates-js/node");
const fs = require("fs");
const assert = require("chai").assert;

const splitToLength = (str, length) => {
  const strArray = str.match(new RegExp(".{1," + length + "}", "g"));
  return strArray.map((entry) => "0x" + entry);
};

initialize().then((zokratesProvider) => {
  // compile source
  const zokFile = fs.readFileSync(
    "./zokrates/knowledge_proof.zok",
    "utf8"
  );
  const source = zokFile.toString();
  const artifacts = zokratesProvider.compile(source);

  // to save compiled program
  // fs.writeFileSync("./zokrates/knowledge_proof.json", JSON.stringify(artifacts));

  // read keys because contract was created with this verification key
  const verificationKey = JSON.parse(
    fs.readFileSync("./zokrates/verification.key")
  );
  const provingKey = new Uint8Array(
    fs.readFileSync("./zokrates/proving.key", null)
  );
  const keypair = { vk: verificationKey, pk: provingKey };
  // to generate a new keypair
  // const keypair = zokratesProvider.setup(artifacts.program);
  var proof = undefined;

  it("Should compute valid proof", () => {
    const secret = splitToLength(witnessInputs.sha256.positive.secret, 8);
    const hash = splitToLength(witnessInputs.sha256.positive.hash, 8);
    const countNullifier = splitToLength(
      witnessInputs.sha256.positive.countNullifier,
      8
    );

    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
      secret,
      hash,
      countNullifier
    ]);
    proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      keypair.pk
    );

  }).timeout(10000);

  it("Should verify valid proof", () => {
    const valid = zokratesProvider.verify(keypair.vk, proof);
    assert.equal(valid, true);
  });

  it("Should not compute invalid proof", () => {
    var error = false;

    try {
      const secret = splitToLength(witnessInputs.sha256.negative.secret, 8);
      const hash = splitToLength(witnessInputs.sha256.negative.hash, 8);
      const countNullifier = splitToLength(
        witnessInputs.sha256.negative.countNullifier,
        8
      );

      const { witness, output } = zokratesProvider.computeWitness(artifacts, [
        secret,
        hash,
        countNullifier
      ]);
      proof = zokratesProvider.generateProof(
        artifacts.program,
        witness,
        keypair.pk
      );
    } catch {
      error = true;
    }

    assert.equal(error, true);
  }).timeout(10000);

  it("Should not verify invalid proof", () => {
    proof.inputs[7] = proof.inputs[7].slice(0, -1) + "2"; // change timestamp
    const valid = zokratesProvider.verify(keypair.vk, proof);
    assert.equal(valid, false);
  });
});
