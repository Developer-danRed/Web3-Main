import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare let window: any;

export type ConvertTypes = 'towei' | 'fromwei';

@Injectable({
  providedIn: 'root',
})
export class Web3commonService {
  constructor() {}

  simpleToWei(amount) {
    return window.web3.utils.toWei(amount);
  }

  simpleFromWei(amount) {
    return window.web3.utils.fromWei(amount);
  }

  public async CreateContract(Abi_array, Address) {
    return new Promise(async (resolve, reject) => {
      let Contract = await new window.web3.eth.Contract(Abi_array, Address);
      resolve(Contract);
    });
  }

  multiAmountConvert(amounts: any, decimals: any, type: ConvertTypes) {
    return new Observable((subscriber) => {
      let convertAmounts = [];

      for (let index = 0; index < amounts.length; index++) {
        let amount = amounts[index];
        let decimal = decimals[index];

        if (+amount > 0) {
          let splitAmount = amount.toString().split('.');

          if (splitAmount.length > 1) {
            if (splitAmount[1].length >= +decimal) {
              amount = +amount;
              amount = +amount.toFixed(decimal);
            }
          }
        }

        let coinwei = Math.pow(10, decimal);

        let sendAmount = type == 'towei' ? amount * coinwei : amount / coinwei;

        sendAmount = this.getNumber(sendAmount);
        convertAmounts.push(sendAmount);

        if (amounts.length == index + 1) {
          subscriber.next(convertAmounts);
          this.stopSubscribe(subscriber);
        }
      }
    });
  }

  amountConvert(amount: any, decimal: any, type: ConvertTypes) {
    if (+amount > 0) {
      let splitAmount = amount.toString().split('.');

      if (splitAmount.length > 1) {
        if (splitAmount[1].length >= +decimal) {
          amount = +amount;
          amount = +amount.toFixed(decimal);
        }
      }
    }

    if (type == 'towei') {
      let coinwei = Math.pow(10, decimal);
      let sendAmount = amount * coinwei;
      return (this.getNumber(sendAmount));
    } else if (type == 'fromwei') {
      let coinwei = Math.pow(10, decimal);
      let sendAmount = amount / coinwei;
      return (this.getNumber(sendAmount));
    }
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

  getDeadLineTime(minute: number) {
    return new Promise(async (resolve, reject) => {
      let dead_time = minute * 60000;
      let date = new Date();
      let timestamp = date.getTime();
      let deadline = timestamp + dead_time;

      resolve(deadline);
    });
  }

  public async Checkgasprice(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (typeof window.web3 !== 'undefined') {
        window.web3.eth.getGasPrice(function (error, result) {
          const sucMsg = {
            status: true,
            gasPrice: Number(result),
          };
          resolve(sucMsg);
        });
      } else {
        const failMsg = {
          status: false,
          message: 'Metamask extension not added on your browser',
        };
        resolve(failMsg);
      }
    });
  }

  LiquditySetGasPrice(toleranceFees: any) {
    return new Promise(async (resolve, reject) => {
      this.Checkgasprice().then(async (success) => {
        let toleranceFee: any = localStorage.getItem('toleranceFee');
        toleranceFees = +toleranceFee > 0 ? toleranceFee : 1;

        let gasprice =
          success.gasPrice + success.gasPrice * (+toleranceFees / 100);

        let gasPriceTowei = await this.amountConvert(gasprice, 18, 'towei');
        resolve(gasPriceTowei.toString());
      });
    });
  }

  async isAddress(address) {
    return await window.web3.utils.isAddress(address);
  }

  stopSubscribe(subscriber: any) {
    if (subscriber) {
      subscriber.unsubscribe();
    }
  }
}
