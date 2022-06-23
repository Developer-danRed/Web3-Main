import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { async } from '@angular/core/testing';
import { BasicService } from '../../blockchain/basic.service';
import { ContractService } from '../../contract/contract.service';

@Pipe({
  name: 'isValidPair',
})
export class IsValidPairPipe implements PipeTransform {
  constructor(private basicService: BasicService, private contractService:ContractService) {}

  transform(pair: any): any {
    if ( 
      !pair ||
      pair == '' ||
      pair == this.basicService.ContractDetails.ZeroAddress ||
      this.basicService.ContractDetails.RouterContract == pair
    ) {
      return false;
    } else {
      return true;
    }
  }
}
