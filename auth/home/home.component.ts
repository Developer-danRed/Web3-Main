import { ThrowStmt } from '@angular/compiler';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from 'src/web3/accounts/accounts.service';
import { AuthService } from 'src/web3/auth/auth.service';


// declare let window: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  shortaddress: any;
  walletAddress: any;
  balance: any;

  constructor(public router: Router, public authService: AuthService,
    public accountsService: AccountsService) { }

  ngOnInit() {
    this.connectWalllet()
  }

  connectWalllet() {
    this.authService.ConnectProviderWallet('metamask').subscribe((suc: any) => {
      console.log("🚀 ~ file: home.component.ts ~ line 24 ~ HomeComponent ~ this.authService.ConnectProviderWallet ~ suc", suc)
      this.shortaddress = suc.shortAddress
      this.walletAddress = suc.address

    })
  }

  con() {
    this.router.navigate(['connect'])
  }
  liq() {
    this.router.navigate(['liquidity'])
  }
  swap(){
    this.router.navigate(['swap'])
  }

 

  copyInputMessage(inputElement){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

}
