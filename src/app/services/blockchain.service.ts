import { Injectable } from '@angular/core';
import { BlockchainInterface } from '../interfaces/blockchain';

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
  scriptHash: string;
  gas: string = "0xd2a4cff31913016155e38e474a2c06d08be276cf";
  neo: string = "0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5";
  rpc = Neon.rpc;
  sc = Neon.sc;
  wallet = Neon.wallet;
  //ToDo: Load balancing of rpc nodes
  rpcClient1 = new Neon.rpc.RPCClient("http://127.0.0.1:50012");
  //rpcClient1 = new Neon.rpc.RPCClient("https://testnet1.neo.coz.io:443");
  //balancer =  api.ApiBalancer(this.rpcClient1, this.rpcClient2);
  constructor() {
    this.scriptHash = "0x946ca3a2b10014a1e35646a8e1889e36eae0d90f";    
    //this.scriptHash = "0x12f8d0d32b237ece13593062883fc28e2cbb799b"; //testnet
   }
  getScriptHash(){
    return this.scriptHash;
  }
  getScriptHashFromAddress(address: string){
    return Neon.wallet.getScriptHashFromAddress(address);
  }
  async getNeoGasBalance(){
    var contractParam = this.sc.ContractParam.hash160(this.scriptHash);
    var params = [contractParam];
    var gasB = await this.rpcClient1.invokeFunction(this.gas,"balanceOf", params);
    var neoB = await this.rpcClient1.invokeFunction(this.neo,"balanceOf", params);
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
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"tokens");
    var tokens = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    //console.log(tokens);
    return tokens;
  }
  async getTopTen(){
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"topTen");
    var topTen = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    //console.log("top ten");
    //console.log(topTen);
    return topTen;
  }
  async getEntries(){
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"entries");
    var entries = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    //console.log(entries);
    return entries;
  }
  async getLastWinner(){
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"lastWinner");
    if(result.state == "FAULT")
    {
      return null;
    }
    
    this.lastWinner = result.stack[0].value.map((i) => {
      var value = "";
      var key = "";
      //console.log(i);
      if(i["type"] == "ByteString")
      {
        value = atob(i.value);
        key = "tokenId";
        //console.log(value);
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
    console.log("last win");
    console.log(this.lastWinner);
    return this.lastWinner;
  }
  
  async getKnight(tokenId: string){
    var contractParam = this.sc.ContractParam.byteArray(tokenId);
    var params = [contractParam];
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"properties", params);
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
    //console.log(this.knight);
    return this.knight;
  }
}
