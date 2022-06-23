import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/walletservice/wallet.service';
import { AccountsService } from 'src/web3/accounts/accounts.service';
import { SwapService } from 'src/web3/swap/swap.service';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  balance: any
  tokenBalance: any

  getSymbolSwap: any
  toWeiAmount: any

  swapUserObj: any = {
    fromTokenAddress: '',
    toTokenAddress: '',
    fromAmount: '',
    toAmount: ''
  }
  swapFromToken: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
    tokenSymbol: ""
  }
  swapToToken: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
    tokenSymbol: ""
  }

  fromObj: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
  }
  toObj: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
  }
  isError:boolean=true
  errorMessage:any

  constructor(public swapService: SwapService, public accountsService: AccountsService,
    public walletService: WalletService,

  ) { }

  ngOnInit() {
    this.getTokenName()

  }


  swapGetBalance(value) {
    if (value.target.name == 'tokenA') {
      this.fromObj.tokenAddress = value.target.value
      this.accountsService.getBalance(this.fromObj.tokenAddress).
        subscribe((res: any) => {
          // console.log(res)
          this.balance = res.balance
          this.accountsService.getAccount(this.fromObj.tokenAddress).subscribe((res: any) => {
            this.swapFromToken.tokenSymbol = res.tokenSymbol
            // console.log("🚀 ~ file: swap.component.ts ~ line 70 ~ SwapComponent ~ this.accountsService.getAccount ~ res.tokenSymbol", res.tokenSymbol)

          })
        })
    }
    else if (value.target.name == 'tokenB') {
      this.toObj.tokenAddress = value.target.value
      this.accountsService.getBalance(this.toObj.tokenAddress).
        subscribe((suc: any) => {
          //console.log(suc)
          this.tokenBalance = suc.balance
          this.accountsService.getAccount(this.toObj.tokenAddress).subscribe((res: any) => {
            this.swapToToken.tokenSymbol = res.tokenSymbol
            //console.log("🚀 ~ file: swap.component.ts ~ line 83 ~ SwapComponent ~ this.accountsService.getAccount ~  res.tokenSymbol", res.tokenSymbol)

          })
        })
    }
  }
  getTokenName() {
    this.walletService.getData('user/webfind')
      .subscribe((result: any) => {
        // console.log("🚀 ~ file: swap.component.ts ~ line 91 ~ SwapComponent ~ .subscribe ~ result", result)
        this.getSymbolSwap = result.message
      })
  }
  // console.log("🚀 ~ file: swap.component.ts ~ line 99 ~ SwapComponent ~ this.toObj,'0x8274915050732D20afb3C456436FEd8FEcb195E2','from').subscribe ~ res", res)
  // this.toObj.tokenAmount = res.amount

  swapGetAmount(amountType) {
    this.swapService.getAmount(this.fromObj,
      this.toObj, '0x8274915050732D20afb3C456436FEd8FEcb195E2', amountType).subscribe((res: any) => {
        console.log("🚀 ~ file: swap.component.ts ~ line 103 ~ SwapComponent ~ this.toObj,'0x8274915050732D20afb3C456436FEd8FEcb195E2',amountType).subscribe ~ res", res)
        if (res.status) {
          this.isError = false;
          if (amountType == 'from')
            this.toObj.tokenAmount = res.amount
          if (amountType == 'to')
            this.fromObj.tokenAmount = res.amount
        } else {
          this.isError = true;
          if(this.fromObj.tokenAmount)
          this.errorMessage='Price Imapact Too High'
          else
          this.errorMessage='Insufficient Liquidity For This Trade'
        }

      })
  }

  swapAdd() {

    this.accountsService.TokenApprove(this.fromObj.tokenAddress,
      18, 0.01).subscribe((result) => {
        console.log(result)

        this.accountsService.TokenApprove(this.toObj.tokenAddress,
          18, 0.01).subscribe((res) => {
            console.log(res)

            let coinWei = Math.pow(10, 18)
            this.toWeiAmount = this.fromObj.tokenAmount * coinWei
            this.swapService.swap(this.fromObj.tokenAmount, this.fromObj,
              this.toObj, this.toWeiAmount).subscribe((suc: any) => {
                console.log("🚀 ~ file: swap.component.ts ~ line 97 ~ SwapComponent ~ this.swapToToken,this.toWeiAmount).subscribe ~ suc", suc)
              })
          })
      })
  }
}