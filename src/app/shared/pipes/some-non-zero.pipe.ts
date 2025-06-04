import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'someNonZero'
})
export class SomeNonZeroPipe implements PipeTransform {
  transform(arr: number[] | null | undefined): boolean {
    if (!arr || !Array.isArray(arr)) return false;
    return arr.some(v => v > 0);
  }
}
