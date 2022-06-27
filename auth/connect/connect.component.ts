import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from 'src/app/walletservice/wallet.service';
import { AuthService } from 'src/web3/auth/auth.service';
declare let window: any;
@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {

  constructor(public walletService: WalletService, public router: Router,
    private authService: AuthService) { }

  ngOnInit() {
   
  }

  metaMaskConnect() {
    this.authService.ConnectWallet('metamask').subscribe((res: any) => {
      console.log(res)
    })
  }
  async swichNetwork() {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
  }

}
