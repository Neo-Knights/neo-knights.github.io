import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html'
})
export class ShowComponent implements OnInit {
  tokenId: string;
  knightExists: Map<string,any> = null;
  attributes: Map<string,any> = null; 
  validateResult: boolean = false;
  validateResultText: string = "loading";
  constructor(private route: ActivatedRoute, private blockchainService: BlockchainService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tokenId = params.get("tokenId");
      if(this.tokenId.length == 6){
        this.getKnight(this.tokenId);
      }
      else{
        this.validateResultText = "id must be 6 chars"
      }
    })
  }
async getKnight(tokenId: string){
  this.blockchainService.getKnight(btoa(tokenId))
    .then((data) => {
        if(data != null)
        {
          
          this.knightExists = data;
          
          this.attributes = data[2].value.map((j) => {
            var value = j.value.value;
            var key = atob(j.key.value);
            return { key: key, value: value}
          });
          this.validateResult = false;
          this.validateResultText = "Already minted";
        }
        else{
          this.knightExists = null;
          this.validateResult = true;
          this.validateResultText = "Id is not known / not minted";
        }
      });
  }
}