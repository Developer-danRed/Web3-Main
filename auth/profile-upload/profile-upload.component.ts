import { HttpClient } from '@angular/common/http';
import { convertUpdateArguments } from '@angular/compiler/src/compiler_util/expression_converter';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { WalletService } from 'src/app/walletservice/wallet.service';

@Component({
  selector: 'app-profile-upload',
  templateUrl: './profile-upload.component.html',
  styleUrls: ['./profile-upload.component.scss']
})
export class ProfileUploadComponent implements OnInit {

  selectIamgesFile: any
  // userData: any
  // registerFromupdate: any


  userObj = {
    email: "",
    firstname: "",
    lastname: "",
    date: "",
    address: "",
    gender: "",
    bloodgruop: ""
  }

  constructor(public walletService: WalletService,
    public httpClient: HttpClient,
    public matSnackBar: MatSnackBar) { }

  ngOnInit() {
  }

  selectImage(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectIamgesFile = file;
    }
  }


  onSubmitUpdate() {
    const formData = new FormData();
    formData.append('file', this.selectIamgesFile);

    this.walletService.postDataupload(this.userObj, "user/updateuser")
      .subscribe((data: any) => {
        console.log("🚀 ~ file: profile-upload.component.ts ~ line 50 ~ ProfileUploadComponent ~ .subscribe ~ data", data)
        this.walletService.snackbarOpenalert(data.message, data.status)
      })
  }
}