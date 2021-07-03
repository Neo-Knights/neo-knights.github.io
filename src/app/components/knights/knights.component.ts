import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-knights',
  templateUrl: './knights.component.html'
})
export class KnightsComponent implements OnInit {

  constructor() { }

  @Input() knights: any[];
  ngOnInit(): void {
  }
  getDateNow(): number{
    return Date.now();
  }
}
