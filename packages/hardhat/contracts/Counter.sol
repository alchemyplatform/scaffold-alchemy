//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Counter {
    uint public x = 10;
    
    function increment() external {
        x++;
    }

    function decrement() external {
        x--;
    }
}
