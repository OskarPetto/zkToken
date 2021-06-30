import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Identity } from "src/app/models/identity";
import { AccountService } from "src/app/services/account.service";
import { IdentityService } from "src/app/services/identity.service";
import { ZKTokenService } from "src/app/services/zktoken.service";
import { ZokratesService } from "src/app/services/zokrates.service";

@Component({
  selector: "zk-create-transfer",
  templateUrl: "./create-transfer.component.html",
  styleUrls: ["./create-transfer.component.scss"],
})
export class CreateTransferComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  identity!: Identity;
  transferCount!: number;
  loadingText = "";
  isMinter = false;
  accounts: string[] = [];
  currentAccount: string = "";

  createTransferForm = this.formBuilder.group({
    toHash: new FormControl("", [
      Validators.required,
      Validators.minLength(64),
      Validators.maxLength(64),
    ]),
    value: new FormControl(0, [Validators.required]),
    account: new FormControl("", [Validators.required]),
  });

  constructor(
    private identityService: IdentityService,
    private zokratesService: ZokratesService,
    private zkTokenService: ZKTokenService,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<CreateTransferComponent>
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.zkTokenService
      .isMinter$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isMinter) => (this.isMinter = isMinter));

    this.zkTokenService
      .getTransferCount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((transferCount) => (this.transferCount = transferCount));

    this.identityService
      .getIdentity$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((identity) => (this.identity = identity));

    this.accountService
      .getAccounts$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((accounts) => (this.accounts = accounts));

    this.accountService
      .getAccount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((account) => {
        this.createTransferForm.patchValue({
          account,
        });
      });
  }

  setAccount(account: string) {
    this.accountService.setAccount(account);
  }

  submitTransfer() {
    const toHash = "0x" + this.createTransferForm.value.toHash;
    const value = this.createTransferForm.value.value;
    const newTransferCount = this.transferCount + 1;

    this.loadingText = "Computing witness and proof...";

    setTimeout(() => {
      const proof = this.zokratesService.generateProof(
        this.identity,
        newTransferCount
      );

      this.loadingText = "Transfering...";

      this.zkTokenService.transfer$(proof, toHash, value)
        .subscribe(
          (_) => {
            this.loadingText = "";
            this.dialogRef.close();
          },
          (err) => {
            const data = err.data;
            const txHash = Object.keys(data)[0]; // TODO improve
            const content = data[txHash];
            console.error(content);
            this.loadingText = content.error;
          },
          () => {}
        );
    }, 10);
  }

  get toHashFormControl() {
    return this.createTransferForm.get("toHash");
  }
}
