import { Injectable } from "@angular/core";

@Injectable()
export abstract class BlockchainInterface {
  abstract getAllKnights(): Promise<any>;
  abstract getTopTen(): Promise<any>;
  abstract getEntries(): Promise<any>;
  abstract getLastWinner(): Promise<any>;
  abstract getKnight(tokenId: string): Promise<any>;
  abstract getNeoGasBalance():  Promise<Map<string,number>>;
  abstract getScriptHash(): string;
  abstract getScriptHashFromAddress(address: string): string; 
}