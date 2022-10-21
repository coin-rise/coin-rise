//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SwapExamples {
    // NOTE: Does not work with SwapRouter02
    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    
    //https://docs.uniswap.org/protocol/reference/deployments
    //wrapped matic Polygon Mumbai
    address public constant WMATIC = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    //address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    /// @notice Swaps a fixed amount of WMATIC for a maximum possible amount of DAI
    function swapExactInputSingle(uint amountIn)
        external
        returns (uint amountOut)
    {
        TransferHelper.safeTransferFrom(
            WMATIC,
            msg.sender,
            address(this),
            amountIn
        );
        TransferHelper.safeApprove(WMATIC, address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
        .ExactInputSingleParams({
            tokenIn: WMATIC,
            tokenOut: DAI,
            // pool fee 0.3%
            fee: 3000,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0,
            // NOTE: In production, this value can be used to set the limit
            // for the price the swap will push the pool to,
            // which can help protect against price impact
            sqrtPriceLimitX96: 0
        });
        amountOut = swapRouter.exactInputSingle(params);
    }

    /// @notice swaps a minimum possible amount of WMATIC for a fixed amount of DAI.
    function swapExactOutputSingle(uint amountOut, uint amountInMaximum)
        external
        returns (uint amountIn)
    {
        TransferHelper.safeTransferFrom(
            WMATIC,
            msg.sender,
            address(this),
            amountInMaximum
        );
        TransferHelper.safeApprove(WMATIC, address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: WMATIC,
                tokenOut: DAI,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        amountIn = swapRouter.exactOutputSingle(params);

        if (amountIn < amountInMaximum) {
            // Reset approval on router
            TransferHelper.safeApprove(WMATIC, address(swapRouter), 0);
            // Refund WMATIC to user
            TransferHelper.safeTransfer(
                WMATIC,
                msg.sender,
                amountInMaximum - amountIn
            );
        }
    }
}