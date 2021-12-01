import { Injectable } from '@angular/core';
import { BlockchainInterface, CONTRACT_HASH, GAS, MintState, NEO } from '../interfaces/blockchain';

declare var require: any;
const Neon = require("@cityofzion/neon-js");
const api = require("@cityofzion/neon-js");

@Injectable({
  providedIn: 'root'
})
export class BlockchainService implements BlockchainInterface{
  stats: any;
  knight: any;
  topTen: any;
  lastWinner: any;

  rpc = Neon.rpc;
  sc = Neon.sc;
  wallet = Neon.wallet;
  //rpcClient1 = new Neon.rpc.RPCClient("http://127.0.0.1:50012");
  //rpcClient2 = new Neon.rpc.RPCClient("http://127.0.0.1:50012");
  rpcClient1 = new Neon.rpc.RPCClient("https://testnet1.neo.coz.io:443");
  rpcClient2 = new Neon.rpc.RPCClient("https://testnet2.neo.coz.io:443");
  
  constructor() { }

  getScriptHash(){
    return CONTRACT_HASH;
  }
  getScriptHashFromAddress(address: string){
    return Neon.wallet.getScriptHashFromAddress(address);
  }
  async trackMint(str: string, state: MintState)
  {
    var mintState = state;
    if(mintState == MintState.NEW)
    {
      var client = this.getRandomClient();
      var tx = await client.getRawTransaction(str,1);
      if(tx.confirmations >= 1)
        mintState = MintState.TRANSFERRED;
    }

    return mintState;
  }
  async getNeoGasBalance(){
    var contractParam = this.sc.ContractParam.hash160(CONTRACT_HASH);
    var params = [contractParam];
    var client = this.getRandomClient();
    var gasB = await client.invokeFunction(GAS,"balanceOf", params);
    var neoB = await client.invokeFunction(NEO,"balanceOf", params);
    var balance: Map<string, number> = new Map();
    (await balance).set("gas", gasB.stack.map((i) => {
      return i.value / Math.pow(10, 8);
    }));
    (await balance).set("neo", neoB.stack.map((i) => {
      return i.value;
    }));
    return balance;
  }
  async getAllKnights(){
    var client = this.getRandomClient();
    var result = await client.invokeFunction(CONTRACT_HASH,"tokens");
    var tokens = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    return tokens;
  }
  async getTopTen(){
    var client = this.getRandomClient();
    var result = await client.invokeFunction(CONTRACT_HASH,"topTen");
    var topTen = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    return topTen;
  }
  async getEntries(){
    var client = this.getRandomClient();
    var result = await client.invokeFunction(CONTRACT_HASH,"entries");
    var entries = result.stack[0]?.iterator.map((i) => {
      return i.value;
    });
    return entries;
  }
  async getLastWinner(){
    var client = this.getRandomClient();
    var result = await client.invokeFunction(CONTRACT_HASH,"lastWinner");
    if(result.state == "FAULT")
    {
      return null;
    }
    
    this.lastWinner = result.stack[0].value.map((i) => {
      var value = "";
      var key = "";
      if(i["type"] == "ByteString")
      {
        value = atob(i.value);
        key = "tokenId";
      }
      else if (i["type"] == "Map"){
        key = "payout";
        value = i.value.map((j) => {
          var value = j.value.value;
          var key = atob(j.key.value);
          if (key == "gas")
          {
            value = value / Math.pow(10, 8);
          }
          return { key: key, value: value}
        });
      }  
      return { key: key, value: value};
    });
    return this.lastWinner;
  }
  
  async getKnight(tokenId: string){
    var contractParam = this.sc.ContractParam.byteArray(tokenId);
    var params = [contractParam];
    var client = this.getRandomClient();
    var result = await client.invokeFunction(CONTRACT_HASH,"properties", params);
    if(result.state == "FAULT")
    {
      return null;
    }
    this.knight = result.stack[0].value.map((i) => {
      var value = i.value.value;
      var key = atob(i.key.value);
      if(i.value["type"] == "ByteString")
      {
        value = atob(value);
      }
      return { key: key, value: value};
    });
    return this.knight;
  }
  private getRandomClient(){
    return Math.round(Math.random()*100) % 2 == 0 ? this.rpcClient1 : this.rpcClient2;
  }
}