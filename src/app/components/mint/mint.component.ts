import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GAS, MintState } from 'src/app/interfaces/blockchain';
import { NeoLineN3Init, NeoLineN3Interface, NeoAccount } from 'src/app/interfaces/neoline';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html'
})
export class MintComponent implements OnInit {
  neoline: Promise<NeoLineN3Interface>;
  neolineN3: Promise<NeoLineN3Interface>;
  account: NeoAccount;
  urlForm: FormGroup;
  redditId: string = "";
  redditUrl: string = "";
  knightExists: Map<string,any> = null;
  knightMinted: Map<string,any> = null;
  showMinted: Boolean = false;
  validateResult: boolean = false;
  validateResultText: string = "";
  mintState: MintState = MintState.NONE;
  mintResult: any = null;
  tokenId: string;

  urlPattern: string = "(^https?://)?(.+)?\.?(reddit\.com/|redd\.it/)(r/.+/)(comments/)((.{6}/.+)|(.{6}$)|(.{6}/$))";
  constructor(private formBuilder: FormBuilder, private blockchainService: BlockchainService) { 
    this.urlForm = this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern(this.urlPattern)]]
    });
  }

  ngOnInit(): void {
    this.initDapi();
    this.urlForm.valueChanges.subscribe(() => {
      this.validateResult = false;
      this.validateResultText = "";
    });  
  }
  ngOnDestroy(): void {
    window.removeAllListeners();
  }
  get m(){
    if(this.urlForm.valid)
    {
      var tmp = this.urlForm.get("url").value as String;
      var startIndex = tmp.indexOf("/comments/");
      if(startIndex > 0)
      {
        startIndex += 10;
        var endIndex = tmp.indexOf("/",startIndex);
        if(endIndex < 0){
          endIndex = tmp.length;
        }
        if((endIndex - startIndex) == 6){
          
          this.redditId = tmp.substring(startIndex,endIndex);
          this.redditUrl = "https://www.reddit.com/"+ this.redditId;
        }
        else{
          this.redditId = "Invalid, please check URL!";
          this.redditUrl = "valid url";
        }
      }
      else{
        this.redditId = "Invalid, please check URL!";
        this.redditUrl = "valid url";
      }
    }
    return this.urlForm.controls;
  }
  public showMint()
  {
    if(!this.showMinted)
    {
      this.showMinted = true;
    }
  }
  public newMint()
  {
    this.mintState = MintState.NONE;
    this.showMinted = false;
    this.knightMinted = null;
    this.mintResult = null;
  }
  public retry()
  {
    this.trackMint(this.tokenId, this.mintResult.txid);
  }
  async connect(){
    (await this.neolineN3).getAccount()?.then((data) => {
      if(data != undefined)
      {        
        if(data.address.startsWith("A"))
        {
          console.log("Change to N3 wallet and connect again..");
        }
        else if(data.address.startsWith("N"))
        {
          this.account = data;
        }
      }
    });
  }
  validate(tokenId: string){
    this.blockchainService.getKnight(btoa(tokenId))
    .then((data) => {
      if(data != null)
      {
        this.knightExists = data;
        this.validateResult = false;
        this.validateResultText = "Already minted";
      }
      else{
        this.knightExists = null;
        this.validateResult = true;
        this.validateResultText = "Not minted yet!";
      }
    });
  }
  async trackMint(tokenId: string, txId: string){
    this.mintState = MintState.NEW;
    await this.delay(7000);
    var retries = 5;
    var count = 0;
    while(this.mintState == MintState.NEW)
    { 
      try {
        this.mintState = await this.blockchainService.trackMint(txId, this.mintState);
      } catch (error) {
        this.mintState == MintState.FAILED;
      }     
      
      count++;
      if(count > retries)
      {
        this.mintState = MintState.FAILED;
      }
      await this.delay(7000);
    }
    retries = 20;
    while(this.mintState == MintState.TRANSFERRED)
    {
      this.knightMinted = await this.blockchainService.getKnight(btoa(tokenId));
      if(this.knightMinted != null){
        this.mintState = MintState.MINTED;
      }
      count++;
      if(count > retries)
      {
        this.mintState = MintState.FAILED;
      }
      await this.delay(7000);
    }
  }
  delay(ms: number) {
    return new Promise (resolve => setTimeout(resolve, ms));
  }
  async mint(data){
    if(data)
    {
      var scriptHash = this.blockchainService.getScriptHash();
      var account = this.blockchainService.getScriptHashFromAddress(this.account.address);
      (await this.neolineN3).invoke({
        scriptHash: GAS,
        operation: 'transfer',
        args: [
          {
            type: "Hash160",
            value: account,          
          },
          {
            type: "Hash160",
            value: scriptHash,          
          },
          {
            type: "Integer",
            value: "5000000"
          },
          {
            type: "String",
            value: data
          }
        ],
        broadcastOverride: false,
        signers: [
          {
            account: account,
            scopes: 1
          }
        ]
      })
      .then(result => {
        this.mintResult = result;
        this.tokenId = data;
        this.trackMint(this.tokenId, result.txid);
        console.log('Invoke transaction success!');
        console.log('Result: ' + JSON.stringify(result));
        console.log('Transaction ID: ' + result.txid);
        console.log('RPC node URL: ' + result.nodeURL);

      })
      .catch((error) => {
        const {type, description, data} = error;
        console.error(error);
        switch(type) {
          
            case 'NO_PROVIDER':
                console.log('No provider available.');
                break;
            case 'RPC_ERROR':
                console.log('There was an error when broadcasting this transaction to the network.');
                break;
            case 'CANCELED':
                console.log('The user has canceled this transaction.');
                break;
            default:
                // Not an expected error object.  Just write the error to the console.
                console.error(error);
                break;
        }
      });
    }
  }
  initDapi(){
    const initCommonDapi = new Promise((resolve, reject) => {
        window.addEventListener('NEOLine.NEO.EVENT.READY', () => {
            this.neoline = NeoLineN3Init();
            if (this.neoline) {
                resolve(this.neoline);
            } else {
                reject('common dAPI method failed to load.');
            }
        });
    });
    const initN3Dapi = new Promise((resolve, reject) => {
        window.addEventListener('NEOLine.N3.EVENT.READY', () => {
          this.neolineN3 = NeoLineN3Init();
            if (this.neolineN3) {
                resolve(this.neolineN3);
            } else {
                reject('N3 dAPI method failed to load.');
            }
        });
    });
    initCommonDapi.then(() => {
        console.log('The common dAPI method is loaded.');
        return initN3Dapi;
    }).then(() => {
        console.log('The N3 dAPI method is loaded.');
    }).catch((err) => {
        console.log(err);
    });
  }
}