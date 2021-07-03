import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  stats: Promise<any>;
  tokens: Promise<string[]>;
  knight: Promise<any>;
  knights: any[] = null;
  constructor(private blockchainService: BlockchainService) {
   }
  ngOnInit(): void {
    this.getStats();
    this.getAllKnights();
  }
  async getStats(){
    this.stats =  this.blockchainService.getStats();
  }
  async getAllKnights(){
    this.tokens = this.blockchainService.getAllKnights();
    this.knights = [];
    (await this.tokens).forEach((tokenId) => {
      this.blockchainService.getKnight(tokenId)
        .then((data) => {
          this.knights.push(data);
          this.knights.sort((a,b) => b[3].value - a[3].value);
          //ToDo: Show numbers > 0 with more than 3 dec places as "< 0.001" 
        });
    });
  }
}
