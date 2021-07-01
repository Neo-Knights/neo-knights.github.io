import { Injectable } from "@angular/core";

@Injectable()
export abstract class BlockchainInterface {
  abstract getStats(): Promise<any>;
  abstract getAllKnights(): Promise<any>;
  abstract getKnight(tokenId: string): Promise<any>;
}