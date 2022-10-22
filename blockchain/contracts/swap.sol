//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SwapToken {
    ISwapRouter public swapRouter;

    address public WMATIC;
    address public DAI;

    constructor(address _swapRouter, address _maticAddress, address _daiAddress) {
        swapRouter = ISwapRouter(_swapRouter);
        WMATIC = _maticAddress;
        DAI = _daiAddress;
    }

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