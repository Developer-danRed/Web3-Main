import { tokenName } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WalletService } from 'src/app/walletservice/wallet.service';
import { AccountsService } from 'src/web3/accounts/accounts.service';
import { ContractService } from 'src/web3/contract/contract.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild("searchForm", { read: NgForm, static: true }) searchForm: any
  userObj = { getToken: " " }

  myTokenDetails: any = {
    tokenName: '',
    tokenAddress: '',
    tokenSymbol: '',
    tokenDecimal: 18,
  }
  searchToken: any
  getsearchToken: any
  settoken: any

  constructor(public accountsService: AccountsService,
    public walletService: WalletService) { }

  ngOnInit() {
  }

  searchTokens() {
    const inputValue = this.searchToken
    this.accountsService.getAccount(this.userObj.getToken).subscribe((response: any) => {
      console.log(response)

      this.settoken = response
      localStorage.setItem("tokenDetails", JSON.stringify(this.settoken))

      this.accountsService.getToken(this.searchToken).then((res: any) => {
        console.log(res)
        this.getsearchToken = res
        this.getsearchToken.tokenAddress = inputValue
        this.walletService.postData(this.getsearchToken, 'user/webuser').subscribe((result: any) => {
          console.log("🚀 ~ file: search.component.ts ~ line 47 ~ SearchComponent ~ this.walletService.postData ~ result", result)
        })
      })
    })
  }
}
