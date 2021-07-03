import { Injectable } from '@angular/core';
import { BlockchainInterface } from '../interfaces/blockchain';

declare var require: any;
const Neon = require("@cityofzion/neon-js");

@Injectable({
  providedIn: 'root'
})
export class BlockchainService implements BlockchainInterface{
  stats: any;
  knight: any;
  scriptHash: string;
  rpc = Neon.rpc;
  sc = Neon.sc;
  //rpcClient = new Neon.rpc.RPCClient("http://127.0.0.1:50012");
  //ToDo: Load balancing of rpc nodes
  rpcClient = new Neon.rpc.RPCClient("https://testnet2.neo.coz.io:443");

  constructor() {
    //this.scriptHash = "0x116be5932d77dd47b945bb994dcefe78c900f81f";
    this.scriptHash = "0x0af362def0832d8616ce84d3b9960785fd780a10";
   }

  async getStats(){
    var result = await this.rpcClient.invokeFunction(this.scriptHash,"stats");
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
    var result = await this.rpcClient.invokeFunction(this.scriptHash,"tokens");
    var tokens = result.stack[0].iterator.map((i) => {
      return i.value;
    });
    return tokens;
  }
  
  async getKnight(tokenId: string){
    var contractParam = this.sc.ContractParam.byteArray(tokenId);
    var params = [contractParam];
    var result = await this.rpcClient.invokeFunction(this.scriptHash,"propertiesExt", params);
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
