import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-knights',
  templateUrl: './knights.component.html',
  styleUrls: ['./knights.component.css']
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
