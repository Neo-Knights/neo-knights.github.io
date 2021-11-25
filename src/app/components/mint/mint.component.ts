import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  validateResult: boolean = false;
  validateResultText: string = "";

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
  async connect(){
    (await this.neolineN3).getAccount().then((data) => {
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
        console.log(data);
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
  async catchMint(){
  }
  async mint(data){
    if(data)
    {
      var scriptHash = this.blockchainService.getScriptHash();
      var account = this.blockchainService.getScriptHashFromAddress(this.account.address);
      (await this.neolineN3).invoke({
        scriptHash: scriptHash,
        operation: 'mint',
        args: [
          {
            type: "Address",
            value: this.account.address,          
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
        console.log('Invoke transaction success!');
        console.log('Result: ' + JSON.stringify(result));
        console.log('Transaction ID: ' + result.txid);
        console.log('RPC node URL: ' + result.nodeURL);

      })
      .catch((error) => {
        const {type, description, data} = error;
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
