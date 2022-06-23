import { Injectable } from '@angular/core';
import { ContractService } from '../contract/contract.service';
import { Observable } from 'rxjs';
import { AccountsService } from '../accounts/accounts.service';
import { AuthService } from '../auth/auth.service';
import { Web3commonService } from '../common/web3common.service';
import { SlippageSettingsObj } from '../liquidity/liquidity.service';
import { BasicService } from '../blockchain/basic.service';
// import { SelectedType } from 'src/app/pages/exchange/tokens-list/tokens-list.service';
import { ConvertWeiPipe } from '../pipes/convertWei/convert-wei.pipe';
// import { SubscribeService } from '../subscribe/subscribe.service';
// import { type } from 'os';

export type SwapType = 'CoinToToken' | 'TokenToToken' | 'TokenToCoin';
export type SelectedType = 'to' | 'from'
@Injectable({
  providedIn: 'root',
})
export class SwapService {
  slippageSettingsObj: SlippageSettingsObj = {
    toleranceFee: 0.1,
    TxDeadLine: 1,
  };

  coinAddress = '0x0000000000000000000000000000000000000000';

  constructor(
    private contractService: ContractService,
    private accountsService: AccountsService,
    private authService: AuthService,
    private web3commonService: Web3commonService,
    private basicService: BasicService,
    private convertWeiPipe:ConvertWeiPipe
 
  ) { }

  getPath(fromToken, toToken, isFormRoated?) {
    return new Promise(async (resolve, reject) => {
      let path: any = [];

      if (
        fromToken == this.coinAddress ||
        fromToken == this.basicService.ContractDetails.WBNBAddress ||
        toToken == this.coinAddress ||
        toToken == this.basicService.ContractDetails.WBNBAddress
      ) {
        if (
          fromToken == this.coinAddress ||
          fromToken == this.basicService.ContractDetails.WBNBAddress
        ) {
          path = [
            this.basicService.ContractDetails.WBNBAddress.toLowerCase(),
            toToken,
          ];
        } else {
          path = [
            fromToken,
            this.basicService.ContractDetails.WBNBAddress.toLowerCase(),
          ];
        }
      } else {
        path = [fromToken, toToken];
      }

      // if (isFormRoated) {
      //   path = [path[1], path[0]];
      // }

      let msg = {
        path: path,
      };

      resolve(msg);
    });
  }

  isFormRoated(pairAddress: any, fromAddress: any) {
    return new Observable((subscriber) => {
      this.contractService
        .PairContract(pairAddress)
        .then(async (PairContract: any) => {
          let fromAdd = await PairContract.methods.token0().call();

          if (fromAddress.toLowerCase() == this.coinAddress.toLowerCase()) {
            fromAddress = this.basicService.ContractDetails.WBNBAddress.toLowerCase();
          }

          if (fromAdd.toLowerCase() == fromAddress.toLowerCase()) {
            subscriber.next(false);
            this.stopSubscribe(subscriber);
          } else {
            subscriber.next(true);
            this.stopSubscribe(subscriber);
          }
        });
    });
  }

  getAmount(fromObj: any, toObj: any, pairAddress: any, type: SelectedType) {
    return new Observable((subscriber) => {
      try {
        console.log(fromObj.tokenAddress, '________ fromObj.tokenAddress');
        if (fromObj.tokenAddress) {
          this.isFormRoated(pairAddress, fromObj.tokenAddress).subscribe(
            (isFormRoated) => {
              console.log(isFormRoated, '____ isFormRoated');
              this.getPath(
                fromObj.tokenAddress,
                toObj.tokenAddress,
                isFormRoated
              ).then((Path: any) => {
                this.contractService
                  .LiqudityContract()
                  .then(async (Contract: any) => {
                    let amountTyped =
                      type == 'from' ? fromObj.tokenAmount : toObj.tokenAmount;

                    let amountTypedTowei = this.convertWeiPipe.transform(
                      amountTyped,
                      fromObj.tokenDecimal,
                      't'
                    );
                    // if (isFormRoated) {
                    //   type == 'from' ? (type = 'to') : (type = 'from');
                    // }

                    try {
                      Contract.methods[
                        type == 'from' ? 'getAmountsOut' : 'getAmountsIn'
                      ](amountTypedTowei, Path.path).call(
                        async (err, getamountsOutresult) => {
                          console.log(err, getamountsOutresult);
                          if (err) {
                            const sucMsg = {
                              status: false,
                            };
                            subscriber.next(sucMsg);
                            this.stopSubscribe(subscriber);
                          } else {
                            let fromAmount = this.convertWeiPipe.transform(
                              getamountsOutresult[0],
                              fromObj.tokenDecimal,
                              'f'
                            );
                            let toAmount = this.convertWeiPipe.transform(
                              getamountsOutresult[1],
                              toObj.tokenDecimal,
                              'f'
                            );

                            if (getamountsOutresult) {
                              const sucMsg = {
                                status: true,
                                message: 'getamountsOutresult Result',
                                resultamount: getamountsOutresult,
                                amount: type == 'from' ? toAmount : fromAmount,
                                toWeiAmount: getamountsOutresult[0],
                              };
                              subscriber.next(sucMsg);
                              this.stopSubscribe(subscriber);
                            } else {
                              const sucMsg = {
                                status: false,
                                message: 'Got error',
                                data: err,
                              };
                              subscriber.next(sucMsg);
                              this.stopSubscribe(subscriber);
                            }
                          }
                        }
                      );
                    } catch (error) { }
                  });
              });
            }
          );
        }
      } catch (error) {
        console.log('hetes');
        const sucMsg = {
          status: false,
        };
        subscriber.next(sucMsg);
        this.stopSubscribe(subscriber);
      }
    });
  }

  async getSwapMinPercentage(Amount: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let percentage = 0.5;

        let min_amount = (+Amount * percentage) / 100;
        min_amount = Amount - min_amount;
        // min_amount = Math.trunc(min_amount);
        let amountOutMin = min_amount.toString();

        console.log(amountOutMin, '__________ amountOutMin');

        let sucMsg = { status: true, minAmount: amountOutMin };

        resolve(sucMsg);
      } catch (error) {
        let sucMsg = { status: true };
        resolve(sucMsg);
      }
    });
  }

  swap(Amount: any, fromObj: any, toObj: any, toWeiAmount: any) {
    return new Observable((subscriber) => {
      this.getSwapMinPercentage(Amount).then((amountOut: any) => {
        console.log(amountOut, '________');
        if (amountOut.status) {
          let TxDeadLine: any = localStorage.getItem('TxDeadLine') || 1;

          this.web3commonService
            .getDeadLineTime(TxDeadLine)
            .then((Deadline) => {
              this.getPath(fromObj.tokenAddress, toObj.tokenAddress).then(
                (Path: any) => {
                  this.web3commonService
                    .LiquditySetGasPrice(this.slippageSettingsObj.toleranceFee)
                    .then((GasPrice) => {
                      this.contractService
                        .LiqudityContract()
                        .then((Contract: any) => {
                          let amount = this.convertWeiPipe.transform(
                            Amount,
                            fromObj.tokenDecimal,
                            't'
                          );

                          let minAmount = this.convertWeiPipe.transform(
                            amountOut.minAmount,
                            fromObj.tokenDecimal,
                            't'
                          );

                          let swapType: SwapType;

                          if (
                            fromObj.tokenAddress.toLowerCase() ==
                            this.coinAddress.toLowerCase()
                          ) {
                            swapType = 'CoinToToken';
                          } else if (
                            toObj.tokenAddress.toLowerCase() ==
                            this.coinAddress.toLowerCase()
                          ) {
                            swapType = 'TokenToCoin';
                          } else {
                            swapType = 'TokenToToken';
                          }

                          console.log(swapType, '_____________ swapType');

                          if (swapType == 'TokenToToken') {
                            this.TokenToToken(
                              amount,
                              minAmount,
                              Path.path,
                              Deadline,
                              GasPrice,
                              Contract,
                              toWeiAmount
                            ).subscribe((suc) => {
                              subscriber.next(suc);
                              this.stopSubscribe(subscriber);
                            });
                          } else if (swapType == 'TokenToCoin') {

                            amount = this.web3commonService.simpleToWei(toObj.tokenAmount);
                            let maxAmount = this.web3commonService.simpleToWei(fromObj.tokenAmount);

                            this.TokenToCoin(
                              amount,
                              maxAmount,
                              Path.path,
                              Deadline,
                              GasPrice,
                              Contract,
                              toWeiAmount
                            ).subscribe((suc) => {
                              subscriber.next(suc);
                              this.stopSubscribe(subscriber);
                            });
                          } else {
                            this.CoinToToken(
                              amount,
                              minAmount,
                              Path.path,
                              Deadline,
                              GasPrice,
                              Contract,
                              toWeiAmount
                            ).subscribe((suc) => {
                              subscriber.next(suc);
                              this.stopSubscribe(subscriber);
                            });
                          }
                        });
                    });
                }
              );
            });
        }
      });
    });
  }

  TokenToToken(
    amount: any,
    minAmount: any,
    Path: any,
    Deadline: any,
    GasPrice: any,
    Contract: any,
    toWeiAmount: any
  ) {
    return new Observable((subscriber) => {
      Contract.methods
        .swapExactTokensForTokens(
          toWeiAmount,
          0,
          Path,
          this.authService.walletAddress,
          Deadline
        )
        .send({
          from: this.authService.walletAddress,
          gasprice: GasPrice,
        })
        .on('transactionHash', (hash) => {
          // console.log("a ------>", hash);
        })
        .on('receipt', async (approveresult) => {
          const sucMsg = {
            status: true,
            message: 'Successfully swap',
            result: approveresult,
          };
          subscriber.next(sucMsg);
          subscriber.unsubscribe();
        })
        .on('error', async (error: any) => {
          const sucMsg = {
            status: false,
            message: 'cancel swap',
          };
          // subscriber.next(sucMsg);
          // this.subscribeService.isWeb3Error.emit(error);
          // subscriber.unsubscribe();
        });
    });
  }

  CoinToToken(
    amount: any,
    minAmount: any,
    Path: any,
    Deadline: any,
    GasPrice: any,
    Contract: any,
    toWeiAmount: any
  ) {
    return new Observable((subscriber) => {
      Contract.methods
        .swapExactBNBForTokens(
          0,
          Path,
          this.authService.walletAddress,
          Deadline
        )
        .send({
          from: this.authService.walletAddress,
          gasprice: GasPrice,
          value: toWeiAmount,
        })
        .on('transactionHash', (hash) => {
        })
        .on('receipt', async (approveresult) => {
          const sucMsg = {
            status: true,
            message: 'Successfully swap',
            result: approveresult,
          };
          subscriber.next(sucMsg);
          this.stopSubscribe(subscriber);
        })
        .on('error', async (error: any) => {
          const sucMsg = {
            status: false,
            message: 'cancel swap',
          };
          // subscriber.next(sucMsg);
          // this.subscribeService.isWeb3Error.emit(error);
          // this.stopSubscribe(subscriber);

        });
    });
  }

  TokenToCoin(
    amount: any,
    maxAmount: any,
    Path: any,
    Deadline: any,
    GasPrice: any,
    Contract: any,
    toWeiAmount: any
  ) {
    console.log(Path);


    return new Observable((subscriber) => {
      console.log(GasPrice, "__ GasPrice"),

        Contract.methods
          // .swapTokensForExactBNB(
          //   '1000000000000000000',
          //   '995000000000000000',
          //   ['0xf068497fce25ddd56331c97c4002d1ba00b91730','0x097feadaba4afcb1466619ba4135fdfd37c0c279'],
          //   this.authService.walletAddress,
          //   Deadline
          // )
          .swapTokensForExactBNB(
            amount,
            maxAmount,
            Path,
            this.authService.walletAddress,
            Deadline
          )
          .send({
            from: this.authService.walletAddress,
            gasprice: GasPrice,
          })
          .on('transactionHash', (hash) => {
          })
          .on('receipt', async (approveresult) => {
            const sucMsg = {
              status: true,
              message: 'Successfully swap',
              result: approveresult,
            };
            subscriber.next(sucMsg);
            subscriber.unsubscribe();
          })
          .on('error', async (error: any) => {
            const sucMsg = {
              status: false,
              message: 'cancel swap',
            };
            // subscriber.next(sucMsg);
            // this.subscribeService.isWeb3Error.emit(error);
            // subscriber.unsubscribe();

          });
    });
  }

  // swapExactTokensForTokens(AmountIn: any, fromObj: any, toObj: any) {
  //   return new Observable((subscriber) => {
  //     this.getSwapMinPercentage(AmountIn).then((amountOut: any) => {
  //       if (amountOut.status) {
  //         let TxDeadLine: any = localStorage.getItem('TxDeadLine') || 1;

  //         this.web3commonService
  //           .getDeadLineTime(TxDeadLine)
  //           .then((Deadline) => {
  //             this.getPath(fromObj.tokenAddress, toObj.tokenAddress).then(
  //               (Path: any) => {
  //                 this.web3commonService
  //                   .LiquditySetGasPrice(this.slippageSettingsObj.toleranceFee)
  //                   .then((GasPrice) => {
  //                     this.contractService
  //                       .LiqudityContract()
  //                       .then((Contract: any) => {
  //                         Contract.methods
  //                           .swapExactTokensForTokens(
  //                             AmountIn,
  //                             amountOut.minAmount,
  //                             Path,
  //                             this.authService.walletAddress,
  //                             Deadline
  //                           )
  //                           .send({
  //                             from: this.authService.walletAddress,
  //                             gasprice: GasPrice,
  //                           })
  //                           .on('transactionHash', (hash) => {
  //                             // console.log("a ------>", hash);
  //                           })
  //                           .on('receipt', async (approveresult) => {
  //                             const sucMsg = {
  //                               status: true,
  //                               message: 'Successfully swap',
  //                               result: approveresult,
  //                             };
  //                             subscriber.next(sucMsg);
  //                             subscriber.unsubscribe();
  //                           });
  //                       });
  //                   });
  //               }
  //             );
  //           });
  //       }
  //     });
  //   });
  // }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
