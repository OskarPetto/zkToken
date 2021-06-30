import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreateTransferComponent } from './components/create-transfer/create-transfer.component';
import { IdentityService } from './services/identity.service';
import { ZokratesService } from './services/zokrates.service';

@Component({
  selector: 'zk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'ZKToken';

  destroy$ = new Subject();
  hasIdentity = false;
  loadingText = "";
  isMinter = false;

  constructor(
    private identityService: IdentityService, 
    private zokratesService: ZokratesService, 
    private dialog: MatDialog
  ) { 
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.identityService.hasIdentity$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(hasIdentity => {
      this.hasIdentity = hasIdentity;
    });

    this.zokratesService.getLoadingText$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(loadingText => {
      this.loadingText = loadingText;
    });
  }

  resetIdentity() {
    this.identityService.resetIdentity();
  }
  
  openTransferDialog() {
    this.dialog.open(CreateTransferComponent);
  }
}
