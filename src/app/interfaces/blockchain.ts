import { Injectable } from "@angular/core";

export enum MintState {
  NONE,
  NEW,
  TRANSFERRED,
  MINTED,
  FAILED
}
export const GAS = "0xd2a4cff31913016155e38e474a2c06d08be276cf";
export const NEO = "0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5";
//export const contractHash = "0x64fb7ef834e9dd90a7170012a85601d72eda7db5"; //privnet   
export const CONTRACT_HASH = "0x12f8d0d32b237ece13593062883fc28e2cbb799b"; //testnet

type MintStateStrings = keyof typeof MintState;

@Injectable()
export abstract class BlockchainInterface {
  abstract getAllKnights(): Promise<any>;
  abstract getTopTen(): Promise<any>;
  abstract getEntries(): Promise<any>;
  abstract getLastWinner(): Promise<any>;
  abstract getKnight(tokenId: string): Promise<any>;
  abstract getNeoGasBalance():  Promise<Map<string,number>>;
  abstract trackMint(tx: string, state: MintState): Promise<MintState>;
  abstract getScriptHash(): string;
  abstract getScriptHashFromAddress(address: string): string; 
}
