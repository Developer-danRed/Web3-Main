import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BasicService {
  TokenABI: any;
  PairABI: any;
  RouterABI: any;
  FinanceReferralABI: any;
  FinanceMasterChefABI: any;
  FinanceChefABI: any;
  FinanceFactoryABI: any;
  AutoFinanceVaultABI: any;


  // eth routercontract= 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

  // bnb router,,=0x44a441C456893fAe0897a9D434830065b18971B6
  
  ContractDetails = {
    WBNBAddress: '',
    RouterContract: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    FinanceReferral: '',
    FinanceMasterChef: '',
    FinanceFactory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    FinanceChef: '',
    FinanceSwapToken: '',
    AutoFinanceVault: '',
    OwnToken: '',
    ZeroAddress: '',
    // Methods
    FinanceAtLastUserAction: "",
    PendingTokenMethod: '',
    FinancePerBlockMethod: '',

    // usd sample token
    USD: ''

  };


  constructor(private httpClient: HttpClient) { }

  public getTokenAbi() {
    return new Observable((subscriber) => {
      this.httpClient.get('assets/json/abi.json').subscribe((suc: any) => {
        this.TokenABI = suc.TokenABI;

        this.RouterABI = suc.RouterABI;
        this.PairABI = suc.PairABI;
        this.FinanceReferralABI = suc.FinanceReferralABI;
        this.FinanceMasterChefABI = suc.FinanceMasterChefABI;
        this.FinanceChefABI = suc.FinanceChefABI;
        this.FinanceFactoryABI = suc.FinanceFactoryABI;
        this.AutoFinanceVaultABI = suc.AutoFinanceVaultABI;

        // this.httpClient
        //   .get('assets/json/address.json')
        //   .subscribe((sucC: any) => {
        //     this.ContractDetails = sucC;
        //     subscriber.next(true);
        //     this.stopSubscribe(subscriber);
        //   });
      });
    });
  }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
