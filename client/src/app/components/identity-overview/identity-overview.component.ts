import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Identity } from 'src/app/models/identity';
import { IdentityService } from 'src/app/services/identity.service';
import { ZKTokenService } from 'src/app/services/zktoken.service';

@Component({
  selector: 'zk-identity-overview',
  templateUrl: './identity-overview.component.html',
  styleUrls: ['./identity-overview.component.scss'],
})
export class IdentityOverviewComponent {
  identity$: Observable<Identity>;
  balance$: Observable<number | undefined>;

  constructor(
    private identityService: IdentityService, 
    private zkTokenService: ZKTokenService  
  ) {
    this.identity$ = this.identityService.getIdentity$();
    this.balance$ = this.zkTokenService.getBalance$();
  }

  shortenHash(hash: string) {
    return hash.substring(2);
  }
  
}
