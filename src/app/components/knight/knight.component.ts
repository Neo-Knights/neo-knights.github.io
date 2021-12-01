import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Url } from 'url';

@Component({
  selector: 'app-knight',
  templateUrl: './knight.component.html'
})
export class KnightComponent implements OnInit {
  redditUrl: string;
  gmUrl: string;
  knightId: string;
  constructor(public domSrv: DomSanitizer) { }

  @Input() knight: any[];
  @Input() tokenId: string;
  @Input() labels: Boolean = false;
  @Input() fs: Boolean = false;
  @Input() glow: Boolean = false;
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.tokenId){
      this.redditUrl = encodeURI("https://reddit.com/" + changes.tokenId.currentValue )
      this.knightId = changes.tokenId.currentValue;
    }
    if(changes.knight){
      this.gmUrl = encodeURI("https://testnet.ghostmarket.io/assets/n3t/neoknights/?search=" + changes.knight.currentValue[0].value + "&symbol=NKT")
    }
  }
}