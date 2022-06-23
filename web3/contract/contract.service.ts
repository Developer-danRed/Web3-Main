import { Injectable } from '@angular/core';
import { BasicService } from '../blockchain/basic.service';

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(private basicService: BasicService) {}

  isWeb3() {
    if (window.web3 && window.web3.eth) {
      return true;
    } else {
      return false;
    }
  }

  public async TokenContract(Address) {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.TokenABI,
          Address
        );
        resolve(Contract);
      });
    }
  }

  public async LiqudityContract() {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.RouterABI,
          this.basicService.ContractDetails.RouterContract
        );
        resolve(Contract);
      });
    }
  }

  public async PairContract(PairContract: any) {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.PairABI,
          PairContract
        );
        resolve(Contract);
      });
    }
  }

  public async ReferralContract() {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.FinanceReferralABI,
          this.basicService.ContractDetails.FinanceReferral
        );
        resolve(Contract);
      });
    }
  }
  public async FinanceMasterChefContract() {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.FinanceMasterChefABI,
          this.basicService.ContractDetails.FinanceMasterChef
        );
        resolve(Contract);
      });
    }
  }

  public async FactoryContract() {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.FinanceFactoryABI,
          this.basicService.ContractDetails.FinanceFactory
        );
        resolve(Contract);
      });
    }
  }

  public async FinanceChefContract() {
    
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.FinanceChefABI,
          this.basicService.ContractDetails.FinanceChef
        );
        resolve(Contract);
      });
    }
  }
  public async FinanceVaultContract() {
   
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.AutoFinanceVaultABI,
          this.basicService.ContractDetails.AutoFinanceVault
        );
        resolve(Contract);
      });
    }
  }

  public async OwnTokenContract() {
    if (this.isWeb3()) {
      return new Promise(async (resolve, reject) => {
        let Contract = await new window.web3.eth.Contract(
          this.basicService.TokenABI,
          this.basicService.ContractDetails.OwnToken
        );
        resolve(Contract);
      });
    }
  }
}
