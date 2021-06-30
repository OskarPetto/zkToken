// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IZKToken {
    /**
     * @dev Returns the total supply of the token.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the balance of the `who` hash.
     */
    function balanceOf(bytes32 who) external view returns (uint);

    /**
     * @dev Transfers `value` tokens from `from` hash in the proof to `to` hash
     * and returns `true` on success.
     */
    function transfer(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c, 
            uint[16] memory input,
            bytes32 to, 
            uint value) external;

    /**
    * @dev Event that is fired on successful transfer.
    */
    event Transfer(bytes32 indexed from, bytes32 indexed to, uint value);
}
