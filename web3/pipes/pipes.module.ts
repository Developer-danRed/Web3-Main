import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvertWeiPipe } from './convertWei/convert-wei.pipe';
import { IsValidPairPipe } from './isValidPair/is-valid-pair.pipe';

@NgModule({
  declarations: [ConvertWeiPipe, IsValidPairPipe],
  imports: [CommonModule],
  providers: [ConvertWeiPipe, IsValidPairPipe],
})
export class PipesModule {}
