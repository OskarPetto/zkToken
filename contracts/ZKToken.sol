pragma solidity ^0.8.0;

import "./verifier.sol";
import "./IZKToken.sol";
import "./MinterRole.sol";

// If identity is needed use https://medium.com/zokrates/building-identity-linked-zksnarks-with-zokrates-a36085cdd40
contract ZKToken is IZKToken, MinterRole {

    uint256 public override totalSupply;
    mapping(bytes32 => uint) public override balanceOf;
    // so that the same proof cannot be used twice
    mapping(bytes32 => uint) public transferCountOf;

    Verifier verifier;

    event Mint(bytes32, uint);

    constructor(Verifier _verifier) {
        verifier = _verifier;
    }

    function mint(bytes32 _to, uint _value) external onlyMinter {
        totalSupply = totalSupply + _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Mint(_to, _value);
    }

    function transfer(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c, 
        uint[16] memory _input,
        bytes32 _to, 
        uint _value) override external {

        bool verifies = verifier.verifyTx(_a, _b, _c, _input);

        require(verifies, "Proof does not verify");       

        // first public input is the hashed secret
        bytes32 from = bytes32(
            (_input[0] << 224) 
            + (_input[1] << 192) 
            + (_input[2] << 160) 
            + (_input[3] << 128) 
            + (_input[4] << 96) 
            + (_input[5] << 64) 
            + (_input[6] << 32) 
            + _input[7]);

        // countNullifier to prevent that a proof is sent twice
        uint countNullifier = 
            (_input[8] << 224) 
            + (_input[9] << 192)
            + (_input[10] << 160) 
            + (_input[11] << 128) 
            + (_input[12] << 96) 
            + (_input[13] << 64) 
            + (_input[14] << 32) 
            + _input[15];

        require(countNullifier == transferCountOf[from] + 1, "countNullifier should be transferCount[from] + 1");

        transferCountOf[from] = countNullifier;
        balanceOf[from] = balanceOf[from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(from, _to, _value);
    }
}