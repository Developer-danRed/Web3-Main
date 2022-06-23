import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasicService } from '../blockchain/basic.service';
import { ContractService } from '../contract/contract.service';
import { Web3commonService } from '../common/web3common.service';
import { AuthService } from '../auth/auth.service';
import { LiquidityComponent } from 'src/app/auth/liquidity/liquidity.component';
// import { SubscribeService } from '../subscribe/subscribe.service';

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  coinAddress = '0x0000000000000000000000000000000000000000';
  tokenName:any
  constructor(
    private contractService: ContractService,
    private web3commonService: Web3commonService,
    private basicService: BasicService,
    // private subscribeService: SubscribeService
    private authService:AuthService
  ) {}

  async getTokenDetails(Contract) {
    return new Promise(async (resolve, reject) => {
      let decimal = await Contract.methods.decimals().call();
      let symbol = await Contract.methods.symbol().call();
      let name = await Contract.methods.name().call();

      let TokenDetails = {
        tokenName: name,
        tokenSymbol: symbol,
        tokenDecimal: +decimal,
        status: true,
      };
      resolve(TokenDetails);
    });
  }

  async getToken(address: string) {
    return new Promise(async (resolve, reject) => {
      this.contractService.TokenContract(address).then((Contract) => {
        this.getTokenDetails(Contract).then((TokenDetails) => {
          resolve(TokenDetails);
        });
      });
    });
  }

  getAccount(address: string) {
    return new Observable((subscriber) => {
      // window;

      let isAddress = window.web3.utils.isAddress(address);

      if (isAddress) {
        this.getToken(address).then((suc) => {
          subscriber.next(suc);
          this.stopSubscribe(subscriber);
        });
      } else {
        let addressDetail = {
          address: address,
          message: 'Token address is not valid',
          status: true,
        };
        subscriber.next(addressDetail);
        this.stopSubscribe(subscriber);
      }
    });
  }

  getBalance(TokenAddress: any, UserAddress?: any): any {
    return new Observable((subscriber) => {
      if (!UserAddress) {
        UserAddress = localStorage.getItem('WalletAddress');

        if (!UserAddress) {
          const errorMsg = {
            status: false,
            message: 'Need to Login',
            rawbalance: '0',
            balance: '0',
          };
          subscriber.next(errorMsg);
          this.stopSubscribe(subscriber);
        }
      }

      if (
        TokenAddress == this.coinAddress ||
        TokenAddress == this.basicService.ContractDetails.WBNBAddress
      ) {
        this.getCoinBalance().subscribe((suc) => {
          subscriber.next(suc);
          this.stopSubscribe(subscriber);
        });
      } else {
        this.getTokenBalance(TokenAddress, UserAddress).subscribe((suc) => {
          subscriber.next(suc);
          this.stopSubscribe(subscriber);
        });
      }
    });
  }

  getCoinBalance() {
    return new Observable((subscriber) => {
      let UserAddress = localStorage.getItem('WalletAddress');

      if (!UserAddress) {
        const errorMsg = {
          status: false,
          message: 'Need to Login',
          rawbalance: '0',
          balance: '0',
        };
        subscriber.next(errorMsg);
        this.stopSubscribe(subscriber);
      }

      var thisNew = this;

      window.web3.eth.getBalance(UserAddress, async function (err, balance) {
        if (balance) {
          const sucMsg = {
            status: true,
            message: 'Get your balance',
            rawbalance: balance,
            balance: await thisNew.web3commonService.amountConvert(
              balance,
              18,
              'fromwei'
            ),
          };
          thisNew.authService.walletbalance=thisNew.web3commonService.amountConvert(
            balance,
            18,
            'fromwei'
          ),
          subscriber.next(sucMsg);
          thisNew.stopSubscribe(subscriber);
        } else {
          const sucMsg = {
            status: false,
            message: 'Got error',
            data: err,
          };
          subscriber.next(sucMsg);
          thisNew.stopSubscribe(subscriber);
        }
      });
    });
  }

  isNeedApprove(TokenAddress: any, Amount: any) {
    return new Observable((subscriber) => {
      this.contractService
        .TokenContract(TokenAddress)
        .then(async (TokenContract: any) => {
          let UserAddress = localStorage.getItem('WalletAddress');

          console.log(TokenAddress, '_____ TokenAddress');

          if (
            TokenAddress == this.coinAddress ||
            TokenAddress == this.basicService.ContractDetails.WBNBAddress
          ) {
            const sucMsg = {
              status: true,
              message: 'no need to approve',
            };
            subscriber.next(sucMsg);
            this.stopSubscribe(subscriber);

            return;
          }

          TokenContract.methods
            .allowance(
              UserAddress,
              this.basicService.ContractDetails.RouterContract
            )
            .call({ from: UserAddress }, async (err, getAllowanceResult) => {
              if (+getAllowanceResult > +Amount) {
                const sucMsg = {
                  status: false,
                  message: 'Successfully approved',
                };
                subscriber.next(sucMsg);
                this.stopSubscribe(subscriber);
              } else {
                const sucMsg = {
                  status: false,
                  message: 'not approved',
                };
                subscriber.next(sucMsg);
                this.stopSubscribe(subscriber);
              }
            });
        });
    });
  }

  TokenApprove(TokenAddress: any, Decimal: any, Amount: any, isTowei?: any) {
    return new Observable((subscriber) => {
      this.contractService
        .TokenContract(TokenAddress)
        .then(async (TokenContract: any) => {
          let UserAddress = localStorage.getItem('WalletAddress');

          let toweiAmount;

          if (!isTowei) {
            toweiAmount = await this.web3commonService.amountConvert(
              Amount,
              Decimal,
              'towei'
            );
          } else {
            toweiAmount = Amount;
          }

          TokenContract.methods
            .approve(
              this.basicService.ContractDetails.RouterContract,
              toweiAmount
            )
            .send({ from: UserAddress })
            .on('receipt', async (approveresult) => {
              const sucMsg = {
                status: true,
                message: 'Successfully approved',
                result: approveresult,
              };
              subscriber.next(sucMsg);
              this.stopSubscribe(subscriber);
            })
            .on('error', async (error) => {
              const sucMsg = {
                status: false,
                message: 'cancel',
              };
              subscriber.next(sucMsg);
              // this.subscribeService.isWeb3Error.emit(true);
              this.stopSubscribe(subscriber);
            });
          // .on('error', async (error) => {
          //   subscriber.next({ status: false });
          //   this.stopSubscribe(subscriber);

          //   this.subscribeService.isWeb3Error.emit(error);
          // });
        });
    });
  }

  // calling functions start

  getTokenBalance(TokenAddress, BalanceAddress) {
    return new Observable((subscriber) => {
      this.contractService
        .TokenContract(TokenAddress)
        .then(async (TokenContract: any) => {
          this.getTokenDetails(TokenContract).then(
            async (TokenDetails: any) => {
              await TokenContract.methods
                .balanceOf(BalanceAddress)
                .call(async (err, balance) => {
                  if (balance) {
                    const sucMsg = {
                      status: true,
                      message: 'Get your balance',
                      rawbalance: balance,
                      balance: await this.web3commonService.amountConvert(
                        balance,
                        TokenDetails.tokenDecimal,
                        'fromwei'
                      ),
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
                });
            }
          );
        });
    });
  }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
