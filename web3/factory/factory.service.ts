import { Injectable } from '@angular/core';
import { async } from '@angular/core/testing';
import { Observable, Subscriber } from 'rxjs';
import { ContractService } from '../contract/contract.service';

@Injectable({
  providedIn: 'root'
})
export class FactoryService {

  getAddress:any
  pairAddress:any
  constructor(public contractService: ContractService,) { }

  getPair() {
    return new Observable((subscriber) => {
      this.contractService.FactoryContract().then(async(contract: any) => {
        console.log("🚀 ~ file: factory.service.ts ~ line 17 ~ FactoryService ~ this.contractService.FactoryContract ~ contract", contract)

         let pair = await contract.methods.getPair('0xA7100AeeA1aFaDA95fD350d7E4DDE36Bb8dB3957',
          '0x78485FaF9169Cf8479Da0BF8E874c6E497052917').call()
          this.getAddress=this.pairAddress
        console.log("🚀 ~ file: factory.service.ts ~ line 18 ~ FactoryService ~ this.contractService.FactoryContract ~ pair", pair)
      })
      subscriber.next(true);
    })
  }
}
