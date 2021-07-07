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
  scriptHash: string;
  rpc = Neon.rpc;
  sc = Neon.sc;
  wallet = Neon.wallet;
  //rpcClient1 = new Neon.rpc.RPCClient("http://127.0.0.1:50012");
  //ToDo: Load balancing of rpc nodes
  rpcClient1 = new Neon.rpc.RPCClient("https://testnet2.neo.coz.io:443");
  //rpcClient2 = new Neon.rpc.RPCClient("https://testnet1.neo.coz.io:443");
  //balancer =  api.ApiBalancer(this.rpcClient1, this.rpcClient2);
  constructor() {
    //this.scriptHash = "0x5f59f6bfca5029319ea3300bdb995f5963df87e6";
    this.scriptHash = "0x0af362def0832d8616ce84d3b9960785fd780a10";
   }

  async getStats(){
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"stats");
    this.stats = result.stack[0].value.map((i) => {
      var value = i.value.value;
      var key = atob(i.key.value);
      if(!(key == "totalSupply" || key == "verifiedSupply"))
      {
        value = this.transformGasDecimal(i.value.value);
      }
      return { key: key, value: value};
    });
    return this.stats;
  }

  async getAllKnights(){
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"tokens");
    var tokens = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    return tokens;
  }
  
  async getKnight(tokenId: string){
    var contractParam = this.sc.ContractParam.byteArray(tokenId);
    var params = [contractParam];
    var result = await this.rpcClient1.invokeFunction(this.scriptHash,"propertiesExt", params);
    this.knight = result.stack[0].value.map((i) => {
      var value = i.value.value;
      var key = atob(i.key.value);
      if(key == "gasAvail")
      {
        value = this.transformGasDecimal(value);
      }
      else if(i.value["type"] == "ByteString" && key != "knightPup")
      {
        value = atob(value);
      }
      return { key: key, value: value};
    });
    return this.knight;
  }
  
  private transformGasDecimal(num) {
    if (num.length <= 8) {
      return "0." + num.padStart(8, "0");
    }
    const decimalPoint = num.length - 8;
    return (
      num.substring(0, decimalPoint) +
      "." +
      num.substring(decimalPoint, num.length)
    );
  }
}
