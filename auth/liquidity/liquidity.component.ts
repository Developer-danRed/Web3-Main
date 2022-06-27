import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WalletService } from 'src/app/walletservice/wallet.service';
import { AccountsService } from 'src/web3/accounts/accounts.service';
import { AuthService } from 'src/web3/auth/auth.service';
import { LiquidityService } from 'src/web3/liquidity/liquidity.service';
import { NgForm } from '@angular/forms';
import { FactoryService } from 'src/web3/factory/factory.service';
import { Router } from '@angular/router';

export type Token = {
  address: "",
  balance?: String,
  name: String,
  symbol: String
  decimal: Number
}

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  styleUrls: ['./liquidity.component.scss']
})
export class LiquidityComponent implements OnInit {

  @ViewChild("liquidityFrom", { read: NgForm, static: true }) liquidityFrom: any

  getTokens: any
  getSymbol: any

  newToken: any
  tokenAddress: any

  balance: any
  tokenBalance: any

  userObj: any = {
    fromTokenAddress: '',
    toTokenAddress: '',
    fromAmount: '',
    toAmount: ''
  }

  fromToken: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
    tokenSymbol: ""
  }
  toToken: any = {
    tokenAddress: "",
    tokenAmount: "",
    tokenDecimal: 18,
    tokenSymbol: ""
  }

  liquidityObj = {
    fromTokenAmount: 0,
    toTokenAmount: 0,
    fromPerToken: 0,
    toPerToken: 0,
    sharePool: 0
  }

  liquidityReserveData: any
  pair: any

  PairAddress: any
  getAddress: any

  constructor(public accountsService: AccountsService,
    public authService: AuthService,
    public walletService: WalletService,
    public changeDetectorRef: ChangeDetectorRef,
    public liquidityService: LiquidityService,
    public factoryService: FactoryService,
    public router:Router) { }

  ngOnInit() {
    this.newToken = this.authService.tokenName
    this.getTokenName()
    this.getPair()
  }
  getPair() {
    this.factoryService.getPair().subscribe((res: any) => {
      // console.log("🚀 ~ file: liquidity.component.ts ~ line 62 ~ LiquidityComponent ~ this.factoryService.getPair ~ res", res)
    })
  }
  sea(){
    this.router.navigate(['search'])
  }


  getBalance(value) {
    if (value.target.name == 'tokenA') {
      this.userObj.fromTokenAddress = value.target.value
      this.accountsService.getBalance(this.userObj.fromTokenAddress).
        subscribe((res: any) => {
          console.log(res)
          this.balance = res.balance
          this.accountsService.getAccount(this.userObj.fromTokenAddress).subscribe((res: any) => {
            this.fromToken.tokenSymbol = res.tokenSymbol
            console.log("🚀 ~ file: liquidity.component.ts ~ line 88 ~ LiquidityComponent ~ this.accountsService.getAccount ~ res.tokenSymbol", res.tokenSymbol)
          })
        })
    }
    else if (value.target.name == 'tokenB') {
      this.userObj.toTokenAddress = value.target.value
      this.accountsService.getBalance(this.userObj.toTokenAddress).
        subscribe((suc: any) => {
          console.log(suc)
          this.tokenBalance = suc.balance
          this.accountsService.getAccount(this.userObj.toTokenAddress).subscribe((res: any) => {
            this.toToken.tokenSymbol = res.tokenSymbol
            console.log("🚀 ~ file: liquidity.component.ts ~ line 100 ~ LiquidityComponent ~ this.accountsService.getAccount ~ res.tokenSymbol", res.tokenSymbol)

          })
        })
    }
  }

  getTokenName() {
    this.walletService.getData('user/webfind')
      .subscribe((result: any) => {
        //console.log("🚀 ~ file: liquidity.component.ts ~ line 119 ~ LiquidityComponent ~ .subscribe ~ result", result)
        this.getTokens = result.message

        this.walletService.getData('user/tokenGet')
          .subscribe((res: any) => {
            // console.log("🚀 ~ file: liquidity.component.ts ~ line 125 ~ LiquidityComponent ~ .subscribe ~ res", res)
            this.getSymbol = res.message
          })
      })
  }

  tokenApproveLiquidity() {
    this.accountsService.TokenApprove(this.userObj.fromTokenAddress,
      18, this.userObj.fromAmount).subscribe((result) => {
        console.log(result)

        this.accountsService.TokenApprove(this.userObj.toTokenAddress,
          18, this.userObj.toAmount).subscribe((res) => {
            console.log(res)

            this.liquidityService.AddLiqudity(this.userObj.fromTokenAddress, 18, this.userObj.fromAmount,
              this.userObj.toTokenAddress, 18, this.userObj.toAmount).subscribe((res: any) => {
                console.log(res)
              })
          })
      })
  }

  reseve(value) {
    this.liquidityService.
      getReseve(
        '0x8274915050732D20afb3C456436FEd8FEcb195E2',
        this.fromToken,
        this.toToken)
      .subscribe((suc: any) => {
        this.liquidityReserveData = suc
        this.changeDetectorRef.detectChanges()
      })
  }

  poolTokenA(value) {
    this.liquidityObj.fromTokenAmount = value.target.value
  }
  poolTokenB(value) {
    this.liquidityObj.toTokenAmount = value.target.value
    this.liquidityObj.fromPerToken = (this.liquidityObj.fromTokenAmount / this.liquidityObj.toTokenAmount)
    this.liquidityObj.toPerToken = (this.liquidityObj.fromTokenAmount / this.liquidityObj.toTokenAmount)
    this.liquidityObj.sharePool = (this.liquidityObj.fromPerToken / this.liquidityObj.toPerToken) * 100
  }

  removeLiquidity() {
    this.accountsService.getBalance('0x8274915050732D20afb3C456436FEd8FEcb195E2').subscribe((res: any) => {
      console.log(res)
      this.pair = res.rawBalance
      this.accountsService.TokenApprove('0x8274915050732D20afb3C456436FEd8FEcb195E2', 18, 0.001).subscribe((result: any) => {
        console.log(result)
        this.liquidityService.RemoveLiqudity('0xA7100AeeA1aFaDA95fD350d7E4DDE36Bb8dB3957', 18, '0x78485FaF9169Cf8479Da0BF8E874c6E497052917', 18, '10000000000000', 100).subscribe((req: any) => {
          console.log(req);
        })
      })
    })
  }

}
