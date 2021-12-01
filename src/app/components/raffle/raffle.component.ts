import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-raffle',
  templateUrl: './raffle.component.html'
})
export class RaffleComponent implements OnInit {
  neoGasBalance: Map<string,number>;
  gasB: number = null;
  neoB: number = null;
  lastWinner: Promise<any>;
  entries: Promise<string[]>;
  entryKnights: Map<string,any> = null;

  constructor(private blockchainService: BlockchainService) { }

  ngOnInit(): void {
    this.getEntries();
    this.getLastWinner();
    this.getNeoGasBalance();
  }
  async getEntries()
  {
    this.entries = this.blockchainService.getEntries();
    this.entryKnights = new Map();
    (await this.entries)?.forEach((tokenId) => {
      this.blockchainService.getKnight(tokenId)
        .then((data) => {
          this.entryKnights.set(atob(tokenId), data);
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