import { Injectable, ChangeDetectorRef } from '@angular/core';
// import { SubscribeService } from '../subscribe/subscribe.service';
import { Observable, Subscriber } from 'rxjs';

declare let window: any;

const Ethereum = (window as any).ethereum;

export type WalletTypes = 'metamask' | 'walletconnect';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  localWeb3: any;
  walletAddress: any;
  walletbalance: any;
  tokenName: any

  isLoign = false;

  providerType: any = Ethereum;

  constructor() {
    this.setDefaultProvider();
  }

  setDefaultProvider() {
    window.web3 = new window.Web3(
      'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    );
  }

  updateProvider(WalletType?: WalletTypes) {
    return new Observable((subscriber) => {
      if (!WalletType) {
        let localWallet: any = localStorage.getItem('WalletType');
        WalletType = localWallet;
      }

      switch (WalletType) {
        case 'metamask':
          this.providerType = Ethereum;
          break;

        case 'walletconnect':
          const WalletConnectProvider = window.WalletConnectProvider.default;

          // e8e762395a9efa832e0efe9c2c71f82b

          this.providerType = new WalletConnectProvider({
            infuraId: '70d5d454064e41b9af24a64296e22c89',
            rpc: { 42: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
          });

          break;

        default:
          break;
      }

      window.web3 = new window.Web3(this.providerType);
      this.localWeb3 = window.web3;
      subscriber.next(true);
      this.stopSubscribe(subscriber);
    });
  }

  isWalletAdded(WalletType: WalletTypes) {
    return new Observable((subscriber) => {
      let isWalletAdded: any = false;

      switch (WalletType) {
        case 'metamask':
          if (Ethereum != undefined) {
            isWalletAdded = true;
          }
          break;

        default:
          if (Ethereum != undefined) {
            isWalletAdded = true;
          }
          break;
      }

      subscriber.next(isWalletAdded);
      this.stopSubscribe(subscriber);
    });
  }

  AddNetwork() {
    return new Observable((subscriber) => {
      try {
        if (typeof window.web3 !== 'undefined') {
          const wasAdded = window.ethereum.request({
            method: 'wallet_addEthereumChain',
            chainId: '0x2a',
            params: [
              {
                chainId: '0x2a',
                chainName: 'Kovan Testnet',
                blockExplorerUrls: ['https://kovan.etherscan.io'],
                nativeCurrency: {
                  name: 'Kovan Testnet',
                  decimals: 18,
                  symbol: 'ETH',
                },
                rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],

                // chainId: '97',
                // chainName: 'Smart Chain Testnet',
                // blockExplorerUrls: ['https://testnet.bscscan.com'],
                // nativeCurrency: {
                //   name: 'BNB Testnet',
                //   decimals: 18,
                //   symbol: 'BNB',
                // },
                // rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              },
            ],
          });

          wasAdded
            .then((suc) => {
              this.CheckChainId().subscribe((sucChain) => {
                if (sucChain) {
                  subscriber.next(true);
                  this.stopSubscribe(subscriber);
                } else {
                  subscriber.next(false);
                  this.stopSubscribe(subscriber);
                }
              });
            })
            .catch((error) => {
              subscriber.next(false);
              this.stopSubscribe(subscriber);
            });
        }
      } catch (error) {
        subscriber.next(false);
        this.stopSubscribe(subscriber);
      }
    });
  }

  CheckChainId() {
    return new Observable((subscriber) => {
      this.localWeb3.eth.getChainId((err: any, netId: any) => {
        if (netId == 42) {
          subscriber.next(true);
          this.stopSubscribe(subscriber);
        } else {
          subscriber.next(false);
          this.stopSubscribe(subscriber);
        }
      });
    });
  }

  ConnectWallet(WalletType: WalletTypes) {
    return new Observable((subscriber) => {
      this.isWalletAdded(WalletType).subscribe((isWalletAdded) => {
        if (!isWalletAdded) {
          let errorMsg = {
            message: 'Kindly check or install the ' + WalletType,
            status: false,
          };
          subscriber.next(errorMsg);
          this.stopSubscribe(subscriber);
        } else {
          this.updateProvider(WalletType).subscribe((suc) => {
            if (WalletType == 'metamask') {
              this.CheckChainId().subscribe((sucCheckChainId) => {
                if (sucCheckChainId) {
                  this.ConnectProviderWallet(WalletType).subscribe((sucWallet) => {
                    subscriber.next(sucWallet);
                    this.stopSubscribe(subscriber);
                  });
                } else {
                  this.AddNetwork().subscribe((sucNetwork) => {
                    if (sucNetwork) {
                      this.ConnectProviderWallet(WalletType).subscribe(
                        (sucPWallet) => {
                          subscriber.next(sucPWallet);
                          this.stopSubscribe(subscriber);
                        }
                      );
                    }
                  });
                }
              });
            } else {
              this.ConnectProviderWallet(WalletType).subscribe((sucProviderWallet) => {
                subscriber.next(sucProviderWallet);
                this.stopSubscribe(subscriber);
              });
            }
          });
        }
      });
    });
  }

  ConnectProviderWallet(WalletType) {
    var thisNew = this;

    return new Observable((subscriber) => {
      this.providerType
        .enable()
        .then((accounts: any) => {
          if (accounts.length > 0) {
            let first = accounts[0].substring(0, 3);
            let last = accounts[0].substring(38, 42);
            let shortAcc = `${first}...${last}`;

            this.isLoign = true;

            this.walletAddress = accounts[0];

            localStorage.setItem('WalletType', WalletType || '');
            localStorage.setItem('WalletAddress', accounts[0]);
            // thisNew.subscribeService.walletReady();

            let successMsg = {
              message: 'Login Success',
              status: true,
              address: accounts[0],
              shortAddress: shortAcc,
            };

            console.log('here work');

            this.providerType.on('disconnect', (error, payload) => {
              console.log(error, 'error');
              console.log(payload, 'payload');
            });

            subscriber.next(successMsg);
            this.stopSubscribe(subscriber);
          }
        })
        .catch((err: any) => {
          let errorMsg = {
            message: err.message,
            status: false,
          };
          subscriber.next(errorMsg);
          this.stopSubscribe(subscriber);
        });
    });
  }

  GetAccount() {
    return new Observable((subscriber: any) => {
      if (!this.isLoign) {
        let errorMsg = {
          message: 'Kindly login the wallet',
          status: false,
        };
        subscriber.next(errorMsg);
        this.stopSubscribe(subscriber);
      }

      this.updateProvider().subscribe((suc) => {
        this.localWeb3.eth.getAccounts(async (err: any, accounts: any) => {
          if (accounts.length > 0) {
            let first = accounts[0].substring(0, 3);
            let last = accounts[0].substring(38, 42);
            let shortAcc = `${first}...${last}`;

            let successMsg = {
              message: 'Account Get Success',
              status: true,
              address: accounts[0],
              shortAddress: shortAcc,
            };
            subscriber.next(successMsg);
            this.stopSubscribe(subscriber);
          }
        });
      });
    });
  }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
