import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  stats: Promise<any>;
  lastWinner: Promise<any>;
  tokens: Promise<string[]>;
  topTokens: Promise<string[]>;
  topTen: Map<string,any> = null;
  entries: Promise<string[]>;
  entryKnights: Map<string,any> = null;
  knight: Promise<any>;
  knights: any[] = null;
  initNeoLine: Promise<any>;
  neoGasBalance: Map<string,number>;
  gasB: number = null;
  neoB: number = null;
  constructor(private blockchainService: BlockchainService) {
   }


  ngOnInit(): void {
    this.getTopTen();
    this.getEntries();
    this.getLastWinner();
    this.getAllKnights();
    this.getNeoGasBalance();
  }

  async getAllKnights(){
    this.tokens = this.blockchainService.getAllKnights();
    this.knights = [];
    (await this.tokens).forEach((tokenId) => {
      this.blockchainService.getKnight(tokenId)
        .then((data) => {
          this.knights.push(data);
        });
    });
  }
  async getEntries()
  {
    this.entries = this.blockchainService.getEntries();
    this.entryKnights = new Map();
    (await this.entries).forEach((tokenId) => {
      this.blockchainService.getKnight(tokenId)
        .then((data) => {
          this.entryKnights.set(atob(tokenId), data);
        });
    });
  }
  async getTopTen(){
    this.topTokens = this.blockchainService.getTopTen();
    this.topTen = new Map();
    (await this.topTokens).forEach((tokenId) => {
      this.blockchainService.getKnight(tokenId)
        .then((data) => {
          this.topTen.set(atob(tokenId), data);
        });
    });
  }
  async getLastWinner()
  {
    this.lastWinner = await this.blockchainService.getLastWinner();
  }
  async getNeoGasBalance()
  {
    var result = await this.blockchainService.getNeoGasBalance();  
    this.gasB = result.get("gas");
    this.neoB = result.get("neo");
  }
}
