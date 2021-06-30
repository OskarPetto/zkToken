import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Identity } from 'src/app/models/identity';
import { Transfer } from 'src/app/models/transfer';
import { IdentityService } from 'src/app/services/identity.service';
import { ZKTokenService } from 'src/app/services/zktoken.service';

@Component({
  selector: 'zk-transfer-history',
  templateUrl: './transfer-history.component.html',
  styleUrls: ['./transfer-history.component.scss']
})
export class TransferHistoryComponent implements OnDestroy, OnInit {

  transfers: Transfer[] = [];
  identity: Identity | undefined;
  destroy$ = new Subject();

  constructor(
    private zktokenService: ZKTokenService, 
    private identityService: IdentityService
    ) {
  }
  ngOnInit(): void {
    this.zktokenService
    .getTransfers$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(transfers => this.transfers = transfers);
    
    this.identityService.getIdentity$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(identity => this.identity = identity);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  shortenHash(hash: string) {
    return hash.substring(2);
  }

}
