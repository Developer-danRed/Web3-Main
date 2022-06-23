import { Injectable } from '@angular/core';
import { ContractService } from '../contract/contract.service';
import { Observable } from 'rxjs';
// import { SubscribeService } from '../subscribe/subscribe.service';
import { AuthService } from '../auth/auth.service';
import { Web3commonService } from '../common/web3common.service';
import { BasicService } from '../blockchain/basic.service';
// import { TokenObj } from 'src/app/pages/exchange/tokens-list/tokens-list.service';
// import { ConvertWeiPipe } from '../pipes/convertWei/convert-wei.pipe';
// import { IsValidPairPipe } from '../pipes/isValidPair/is-valid-pair.pipe';
// import { FactoryService } from '../factory/factory.service';

export interface SlippageSettingsObj {
  TxDeadLine: any;
  toleranceFee: any;
}

@Injectable({
  providedIn: 'root',
})
export class LiquidityService {
  slippageSettingsObj: SlippageSettingsObj = {
    toleranceFee: 0.1,
    TxDeadLine: 1,
  };

  coinAddress = '0x0000000000000000000000000000000000000000';

  constructor(
    private contractService: ContractService,
    // private subscribeService: SubscribeService,
    private authService: AuthService,
    private web3commonService: Web3commonService,
    private basicService: BasicService,
    // private convertWeiPipe: ConvertWeiPipe,
    // private isValidPairPipe: IsValidPairPipe,
    // private factoryService: FactoryService
  ) {}

  // getSlippageSettings() {}

  newPriceOfPoolShare(fromObj, toObj) {
    return new Observable((subscriber) => {
      let fromAmount = fromObj.tokenAmount;
      let toAmount = toObj.tokenAmount;

      if (
        fromAmount != null &&
        toAmount != null &&
        fromAmount != 'undefined' &&
        toAmount != 'undefined' &&
        fromAmount != '0.0000' &&
        toAmount != '0.0000' &&
        fromAmount != '' &&
        toAmount != '' &&
        fromAmount &&
        toAmount
      ) {
        var from = +fromAmount / +toAmount;
        var to = +toAmount / +fromAmount;

        console.log(from, '_from');

        // from = this.convertWeiPipe.transform(from, fromObj.decimal, 'n');
        // to = this.convertWeiPipe.transform(to, toObj.decimal, 'n');

        console.log(from, '______ from');

        let poolShareData = {
          percentage: '100',
          fromAmount: from,
          toAmount: to,
        };
        subscriber.next(poolShareData);
        this.stopSubscribe(subscriber);
      } else {
        let poolShareData = {
          percentage: '0',
          fromAmount: '0',
          toAmount: '0',
        };
        subscriber.next(poolShareData);
        this.stopSubscribe(subscriber);
      }
    });
  }

  getNumber(x: any) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + new Array(e).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    return x.toString();
  }

  AddLiqudity(
    tokenA: any,
    tokenADecimal: any,
    amountADesired: any,

    tokenB: any,
    tokenBDecimal: any,
    amountBDesired: any
  ) {
    return new Observable((subscriber) => {
      let amountAMin = 1,
        amountBMin = 1;

      let TxDeadLine: any = localStorage.getItem('TxDeadLine') || 1;

      this.web3commonService.getDeadLineTime(TxDeadLine).then((Deadline) => {
        this.web3commonService
          .LiquditySetGasPrice(this.slippageSettingsObj.toleranceFee)
          .then((GasPrice) => {
            this.web3commonService
              .multiAmountConvert(
                [amountADesired, amountBDesired],
                [tokenADecimal, tokenBDecimal],
                'towei'
              )
              .subscribe((successArray) => {
                let amountAToWeiAmount = successArray[0];
                let amountBToWeiAmount = successArray[1];

                let token: any;
                let tokenToWeiAmount: any;
                let coinToWeiAmount: any;

                if (
                  tokenA == this.coinAddress ||
                  tokenA == this.basicService.ContractDetails.WBNBAddress
                ) {
                  token = tokenB;
                  tokenToWeiAmount = amountBToWeiAmount;
                  coinToWeiAmount = amountAToWeiAmount;
                } else if (
                  tokenB == this.coinAddress ||
                  tokenB == this.basicService.ContractDetails.WBNBAddress
                ) {
                  token = tokenA;
                  tokenToWeiAmount = amountAToWeiAmount;
                  coinToWeiAmount = amountBToWeiAmount;
                }

                if (token == undefined) {
                  this.AddLiqudityToken(
                    tokenA,
                    tokenB,
                    amountAToWeiAmount,
                    amountBToWeiAmount,
                    amountAMin,
                    amountBMin,
                    GasPrice,
                    Deadline
                  ).subscribe((success) => {
                    subscriber.next(success);
                    this.stopSubscribe(subscriber);
                  });
                } else {
                  this.AddLiqudityCoin(
                    token,
                    tokenToWeiAmount,
                    amountAMin,

                    coinToWeiAmount,
                    amountBMin,

                    GasPrice,
                    Deadline
                  ).subscribe((success) => {
                    subscriber.next(success);
                    this.stopSubscribe(subscriber);
                  });
                }
              });
          });
      });
    });
  }

  AddLiqudityToken(
    tokenA: any,
    tokenB: any,
    amountAToWeiAmount: any,
    amountBToWeiAmount: any,
    amountAMin: any,
    amountBMin: any,
    GasPrice: any,
    Deadline: any
  ) {
    return new Observable((subscriber) => {
      this.contractService.LiqudityContract().then((Contract: any) => {
        Contract.methods
          .addLiquidity(
            tokenA,
            tokenB,
            amountAToWeiAmount,
            amountBToWeiAmount,
            amountAMin,
            amountBMin,
            this.authService.walletAddress,
            Deadline
          )
          .send({
            from: this.authService.walletAddress,
            gasprice: GasPrice,
          })
          .on('confirmation', (confirmationNumber, Liquidityresult) => {})
          .on('receipt', async (Liquidityresult) => {
            const sucMsg = {
              status: true,
              step: 2,
              message: 'Successfully Added',
              result: Liquidityresult,
            };
            subscriber.next(sucMsg);
            this.stopSubscribe(subscriber);
          })
          .on('error', async (error) => {
            const sucMsg = {
              status: false,
              message: 'error',
            };
            subscriber.next(sucMsg);
            // this.subscribeService.isWeb3Error.emit(true);
            this.stopSubscribe(subscriber);
          });
      });
    });
  }

  AddLiqudityCoin(
    tokenA: any,
    tokenAToWeiAmount: any,
    amountAMin: any,

    coinToWeiAmount: any,
    amountCoinMin: any,

    GasPrice: any,
    Deadline: any
  ) {
    function Li() {
      this.tokenA = tokenA;
      this.tokenAToWeiAmount = tokenAToWeiAmount;
      this.amountAMin = amountAMin;
      this.amountCoinMin = amountCoinMin;
      this.Deadline = Deadline;
      this.coinToWeiAmount = coinToWeiAmount;
      this.GasPrice = GasPrice;
    }

    var liq = new Li();

    return new Observable((subscriber) => {
      this.contractService.LiqudityContract().then((Contract: any) => {
        Contract.methods
          .addLiquidityBNB(
            tokenA,
            tokenAToWeiAmount,
            amountAMin,
            amountCoinMin,
            this.authService.walletAddress,
            Deadline
          )
          .send({
            from: this.authService.walletAddress,
            value: coinToWeiAmount,
            gasprice: coinToWeiAmount,
          })
          .on('confirmation', (confirmationNumber, Liquidityresult) => {
            // subscriber.next(confirmationNumber);
          })
          .on('receipt', async (Liquidityresult) => {
            const sucMsg = {
              status: true,
              message: 'Successfully added',
              result: Liquidityresult,
            };
            subscriber.next(sucMsg);
            this.stopSubscribe(subscriber);
          })
          .on('error', async (error) => {
            const sucMsg = {
              status: false,
              message: 'error',
            };
            subscriber.next(sucMsg);
            // this.subscribeService.isWeb3Error.emit(true);
            this.stopSubscribe(subscriber);
          });
      });
    });
  }

  calculateShareOfPool(
    FromToken: any,
    ToToken: any,
    BeforeBalance: any,
    TotalSupply: any
  ) {
    if (!FromToken.tokenAmount) {
      FromToken.tokenAmount = 0;
    }
    if (!ToToken.tokenAmount) {
      ToToken.tokenAmount = 0;
    }

    // sharePool =  (A * B).SqureRoot + BeforeBalance / TotalSupply + (A * B).SqureRoot * 100;

    let currentBalance: any = Math.sqrt(
      Number(FromToken.tokenAmount) * Number(ToToken.tokenAmount)
    );

    if (Math.abs(currentBalance) < 1.0) {
      // Checking exponential value
      currentBalance = Number.parseFloat(currentBalance).toFixed(18);
    }

    console.log(currentBalance, '++++++ currentBalance');
    console.log(BeforeBalance, '++++++ BeforeBalance');
    console.log(TotalSupply, '++++++ TotalSupply');

    var sharePool =
      ((+currentBalance + +BeforeBalance) / (+TotalSupply + +currentBalance)) *
      100;

    console.log(sharePool, '++++++ sharePool');

    // Check the values is below 0.001
    var match = ('' + sharePool).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      let poolShare = {
        percentageDisplay: '0.00 %',
        percentage: 0,
      };

      return poolShare;
    }
    var count = Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0)
    );

    var toFixValue = +sharePool.toFixed(2);

    if (toFixValue.toString() == '0.00' || toFixValue == 0) {
      if (count > 3) {
        let poolShare = {
          percentageDisplay: '<0.01 %',
          percentage: 0,
        };
        return poolShare;
      } else {
        let poolShare = {
          percentageDisplay: '0.00 %',
          percentage: 0,
        };
        return poolShare;
      }
    } else {
      let poolShare = {
        percentageDisplay: toFixValue + ' %',
        percentage: toFixValue,
      };
      return poolShare;
    }
  }

  RemoveLiqudity(
    tokenA: any,
    tokenADecimal: any,

    tokenB: any,
    tokenBDecimal: any,

    removedAmount: any,
    removePercentage: any
  ) {
    return new Observable((subscriber) => {
      let amountAMin = 1,
        amountBMin = 1;

      let TxDeadLine: any = localStorage.getItem('TxDeadLine') || 1;

      this.web3commonService.getDeadLineTime(TxDeadLine).then((Deadline) => {
        this.web3commonService
          .LiquditySetGasPrice(this.slippageSettingsObj.toleranceFee)
          .then((GasPrice) => {
            console.log(removedAmount, '_____removedAmount');

            let removedAmountToWeiAmount;

            if (+removePercentage == 100) {
              removedAmountToWeiAmount = removedAmount;
            } else {
              // removedAmountToWeiAmount = this.convertWeiPipe.transform(
              //   removedAmount,
              //   18,
              //   't'
              // );
            }
            let token: any;

            if (
              tokenA == this.coinAddress ||
              tokenA == this.basicService.ContractDetails.WBNBAddress
            ) {
              token = tokenB;
            } else if (
              tokenB == this.coinAddress ||
              tokenB == this.basicService.ContractDetails.WBNBAddress
            ) {
              token = tokenA;
            }

            if (token == undefined) {
              this.RemoveLiqudityToken(
                tokenA,
                tokenB,
                removedAmountToWeiAmount,
                amountAMin,
                amountBMin,
                GasPrice,
                Deadline
              ).subscribe((success) => {
                subscriber.next(success);
              });
            } else {
              this.RemoveLiqudityCoin(
                token,
                removedAmountToWeiAmount,
                amountAMin,
                amountBMin,
                GasPrice,
                Deadline
              ).subscribe((success) => {
                subscriber.next(success);
                this.stopSubscribe(subscriber);
              });
            }
            // });
          });
      });
    });
  }

  RemoveLiqudityToken(
    tokenA,
    tokenB,
    removedAmountToWeiAmount,
    amountAMin,
    amountBMin,
    GasPrice,
    Deadline
  ) {
    console.log(
      tokenA,
      tokenB,
      removedAmountToWeiAmount,
      amountAMin,
      amountBMin,
      this.authService.walletAddress,
      Deadline
    );

    return new Observable((subscriber) => {
      this.contractService.LiqudityContract().then((Contract: any) => {
        Contract.methods
          .removeLiquidity(
            tokenA,
            tokenB,
            removedAmountToWeiAmount,
            amountAMin,
            amountBMin,
            this.authService.walletAddress,
            Deadline
          )
          .send({ from: this.authService.walletAddress, gasprice: GasPrice })

          .on('receipt', async (Liquidityresult) => {
            const sucMsg = {
              status: true,
              message: 'Successfully removed',
              result: Liquidityresult,
            };
            subscriber.next(sucMsg);
            this.stopSubscribe(subscriber);
          })
          .on('error', async (error) => {
            const sucMsg = {
              status: false,
              message: 'user cancel',
            };
            subscriber.next(sucMsg);
            // this.subscribeService.isWeb3Error.emit(true);
            this.stopSubscribe(subscriber);
          });
      });
    });
  }

  RemoveLiqudityCoin(
    tokenA: any,
    removedAmountToWeiAmount: any,
    amountAMin: any,
    amountCoinMin: any,
    GasPrice: any,
    Deadline: any
  ) {
    console.log(removedAmountToWeiAmount, '___+removedAmountToWeiAmount');
    return new Observable((subscriber) => {
      this.contractService.LiqudityContract().then((Contract: any) => {
        Contract.methods
          .removeLiquidityBNB(
            tokenA,
            removedAmountToWeiAmount,
            amountAMin,
            amountCoinMin,
            this.authService.walletAddress,
            Deadline
          )
          .send({ from: this.authService.walletAddress, gasprice: GasPrice })

          .on('receipt', async (Liquidityresult) => {
            const sucMsg = {
              status: true,
              message: 'Successfully removed',
              result: Liquidityresult,
            };
            subscriber.next(sucMsg);
            this.stopSubscribe(subscriber);
          })
          .on('error', async (error) => {
            const sucMsg = {
              status: false,
              message: 'user cancel',
            };
            // subscriber.next(sucMsg);
            // this.subscribeService.isWeb3Error.emit(true);
            this.stopSubscribe(subscriber);
          });
      });
    });
  }

  // // Call Start
  // getReserves(pairAddress: any, fromToken: TokenObj, toToken: TokenObj) {
  //   console.log(pairAddress, 'pairAddress');
  //   console.log(fromToken, 'fromToken');
  //   console.log(toToken, 'toToken');

  //   return new Observable((subscriber) => {
  //     let isValidPair = this.isValidPairPipe.transform(pairAddress);

  //     if (!isValidPair) {
  //       this.factoryService
  //         .getPair(fromToken.tokenAddress, toToken.tokenAddress)
  //         .subscribe((suc: any) => {
  //           if (suc.status) {
  //             pairAddress = suc.pairAddress;
  //             this.getReseve(pairAddress, fromToken, toToken).subscribe(
  //               (suc:any) => {
  //                 suc.pairAddress = pairAddress;
  //                 subscriber.next(suc);
  //                 this.stopSubscribe(subscriber);
  //               }
  //             );
  //           } else {
  //             const sucMsg = {
  //               status: false,
  //               message: 'No Pair',
  //             };
  //             subscriber.next(sucMsg);
  //             this.stopSubscribe(subscriber);
  //           }
  //         });
  //     } else {
  //       this.getReseve(pairAddress, fromToken, toToken).subscribe((suc :any) => {
  //         suc.pairAddress = pairAddress;
  //         subscriber.next(suc);
  //         this.stopSubscribe(subscriber);
  //       });
  //     }

  //     console.log(pairAddress, '___ pairAddress');
  //   });
  // }

  getReseve(pairAddress, fromToken, toToken) {
    return new Observable((subscriber) => {
      if (pairAddress) {
        this.contractService
          .PairContract(pairAddress)
          .then((PairContract: any) => {
            PairContract.methods
              .balanceOf(this.authService.walletAddress)
              .call(async (err, pairBalance) => {
                PairContract.methods
                  .getReserves()
                  .call(
                    { from: this.authService.walletAddress },
                    async (err, getReservesResult) => {
                      let fromAddress = await PairContract.methods
                        .token0()
                        .call();

                      let fromAmountBig, toAmountBig, fromTokenAddress;

                      fromTokenAddress = fromToken.tokenAddress;

                      if (fromTokenAddress == this.coinAddress) {
                        fromTokenAddress = this.basicService.ContractDetails
                          .WBNBAddress;
                      }

                      if (
                        fromTokenAddress.toLowerCase() ==
                        fromAddress.toLowerCase()
                      ) {
                        fromAmountBig = getReservesResult[0];
                        toAmountBig = getReservesResult[1];
                      } else {
                        fromAmountBig = getReservesResult[1];
                        toAmountBig = getReservesResult[0];
                      }

                      this.web3commonService
                        .multiAmountConvert(
                          [fromAmountBig, toAmountBig, pairBalance],
                          [fromToken.tokenDecimal, toToken.tokenDecimal, 18],
                          'fromwei'
                        )
                        .subscribe((convertsValues) => {
                          let calculatedAmount =
                            convertsValues[0] / convertsValues[1];

                          PairContract.methods
                            .totalSupply()
                            .call(async (err, totalsupplyBig) => {
                              let totalSup = await this.web3commonService.amountConvert(
                                totalsupplyBig,
                                18,
                                'fromwei'
                              );

                              let pollShare: any = await this.calculateShareOfPool(
                                fromToken,
                                fromToken,
                                convertsValues[2], // pairBalance
                                totalSup // pairTotalSupply
                              );

                              let fromAmount =
                                convertsValues[0] / convertsValues[1];
                              fromAmount = this.getNumber(fromAmount);

                              // user pooled value calcution Start

                              let toAmount =
                                convertsValues[1] / convertsValues[0];
                              toAmount = this.getNumber(toAmount);

                              let fromAmountPooled =
                                (convertsValues[0] * pollShare.percentage) /
                                100;
                              let toAmountPooled =
                                (convertsValues[1] * pollShare.percentage) /
                                100;

                              // user pooled value calcution End

                              const sucMsg = {
                                status: true,
                                message: 'Paired Data',
                                resultamount: getReservesResult,
                                calculatedAmount: calculatedAmount,
                                totalSupply: totalSup,
                                pairBalance: convertsValues[2],
                                pairBalanceToWei: pairBalance,
                                pollSharePercentageDisplay:
                                  pollShare.percentageDisplay,
                                pollSharePercentage: pollShare.percentage,
                                fromAmount: fromAmount,
                                toAmount: toAmount,
                                fromAmountBalance: convertsValues[0],
                                toAmountBalance: convertsValues[1],
                                fromAmountPooled: fromAmountPooled,
                                toAmountPooled: toAmountPooled,
                              };
                              console.log(sucMsg, '__________ sucMsg');
                              subscriber.next(sucMsg);
                              this.stopSubscribe(subscriber);
                            });
                        });
                    }
                  );
              });
          });
      } else {
        const sucMsg = {
          status: true,
          message: 'No Pair',
        };
        subscriber.next(sucMsg);
        this.stopSubscribe(subscriber);
      }
    });
  }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
