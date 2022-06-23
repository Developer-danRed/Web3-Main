import { Pipe, PipeTransform } from '@angular/core';

export type ConvertTypes = 't' | 'f' | 'n';

declare let window: any;

@Pipe({
  name: 'convertWei',
})
export class ConvertWeiPipe implements PipeTransform {
  // transform(amount: any, decimal: any, type: any) {
  // 1000000000000000000  - ether  - 18
  // 1000000000   - gwei -9
  // 1000000   - mwei -6
  //   let convertdAmount: any;

  //   if (+amount > 0) {
  //     let splitAmount = amount.toString().split('.');

  //     if (splitAmount.length > 1) {
  //       if (splitAmount[1].length >= +decimal) {
  //         amount = +amount;
  //         amount = +amount.toFixed(decimal);
  //       }
  //     }
  //   }

  //   if (type == 't' || type == 'towei') {
  //     switch (+decimal) {
  //       case 18:
  //         convertdAmount = this.convertToWei(amount, 'ether', decimal);
  //         break;
  //       case 9:
  //         convertdAmount = this.convertToWei(amount, 'gwei', decimal);
  //         break;
  //       case 8:
  //         convertdAmount = this.convertEightDigit(amount, 'towei');
  //         break;
  //       case 6:
  //         convertdAmount = this.convertToWei(amount, 'mwei', decimal);
  //         break;
  //       default:
  //         break;
  //     }
  //     console.log(convertdAmount, '_____ convertdAmount');
  //     return convertdAmount;
  //   } else {
  //     switch (+decimal) {
  //       case 18:
  //         convertdAmount = this.convertFromWei(amount, 'ether');
  //         break;
  //       case 9:
  //         convertdAmount = this.convertFromWei(amount, 'gwei');
  //         break;
  //       case 8:
  //         convertdAmount = this.convertEightDigit(amount, 'fromwei');
  //         break;
  //       case 6:
  //         convertdAmount = this.convertFromWei(amount, 'mwei');
  //         break;
  //       default:
  //         break;
  //     }

  //     return convertdAmount;
  //   }
  // }

  // convertToWei(amount, type, decimal) {
  //   if (Math.abs(amount) < 1.0) {
  //     amount = Number.parseFloat(amount).toFixed(decimal);
  //   }

  //   return window.web3.utils.toWei(amount.toString(), type);
  // }

  // convertFromWei(amount, type) {
  //   return window.web3.utils.fromWei(amount.toString(), type);
  // }

  // convertEightDigit(amount: any, type: any) {
  //   if (type == 'towei') {
  //     let convertAmount = +amount * 100000000;
  //     let converAmountSplited = convertAmount.toString().split('.');
  //     if (converAmountSplited.length > 0) {
  //       return converAmountSplited[0];
  //     } else {
  //       return convertAmount;
  //     }
  //   } else {
  //     let convertAmount = +amount / 100000000;
  //     return convertAmount;
  //   }
  // }

  transform(amount: any, decimal: any, type: ConvertTypes): any {
    
    if (+amount > 0) {
      let splitAmount = amount.toString().split('.');

      if (splitAmount.length > 1) {
        if (splitAmount[1].length >= +decimal) {
          amount = +amount;
          amount = +amount.toFixed(decimal);
        }
      }
    }

    if (type == 't') {
      // ToWei
      let coinwei = Math.pow(10, decimal);
      let sendAmount = +amount * coinwei;
      return (sendAmount = this.getNumber(sendAmount));
    } else if (type == 'f') {
      // FromWei
      let coinwei = Math.pow(10, decimal);
      let sendAmount = +amount / coinwei;
      return (sendAmount = this.getNumber(sendAmount));
    } else if('n'){
      // Normal
      return (this.getNumber(amount));
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
}
