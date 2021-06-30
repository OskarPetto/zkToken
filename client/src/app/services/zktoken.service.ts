import { Injectable } from "@angular/core";
import { BehaviorSubject, from, Observable, Subscription, zip } from "rxjs";
import { mergeMap, map, first } from "rxjs/operators";
import { Proof } from "zokrates-js";
import { Transfer } from "../models/transfer";
import { IdentityService } from "./identity.service";
import { AccountService } from "./account.service";

// https://github.com/ChainSafe/web3.js/issues/4094
// https://github.com/ChainSafe/web3.js/issues/4070
// https://stackoverflow.com/questions/66749738/angular-web3-js-module-not-found-error-cant-resolve-crypto
// https://stackoverflow.com/questions/65752381/web3-and-angular-11-broken-dependencies
@Injectable({
  providedIn: "root",
})
export class ZKTokenService {
  private zkToken;
  private transfers$ = new BehaviorSubject<Transfer[]>([]);
  private balance$ = new BehaviorSubject(0);
  private transferCount$ = new BehaviorSubject(0);
  private canMint$ = new BehaviorSubject<boolean>(false);
  private identityHash: string | undefined;
  private transferSubscription!: Subscription;
  private mintSubscription!: Subscription;

  constructor(
    private accountService: AccountService,
    private identityService: IdentityService
  ) {
    this.zkToken = this.accountService.getContract();

    this.fetchAll();
  }

  private fetchAll() {
    this.fetchBalance();
    this.fetchTransfers();
    this.fetchTransferCount();
    this.fetchIsMinter();

    this.transferSubscription = this.zkToken.events
      .Transfer({ fromBlock: 0 })
      .on("data", (event: any) => {
        this.fetchBalance();
        this.fetchTransfers();
        this.fetchTransferCount();
      });

    this.mintSubscription = this.zkToken.events
      .Mint({ fromBlock: 0 })
      .on("data", (event: any) => {
        this.fetchBalance();
      });

    this.identityService.getIdentity$().subscribe((identity) => {
      this.identityHash = identity.hash;
      this.fetchBalance();
      this.fetchTransfers();
      this.fetchTransferCount();
    });

    this.accountService.getAccount$().subscribe((_) => {
      this.fetchIsMinter();
    });
  }

  ngOnDestroy() {
    this.transferSubscription.unsubscribe();
    this.mintSubscription.unsubscribe();
  }

  getTransfers$(): Observable<Transfer[]> {
    return this.transfers$.asObservable();
  }

  getBalance$(): Observable<number> {
    return this.balance$.asObservable();
  }

  getTransferCount$(): Observable<number> {
    return this.transferCount$.asObservable();
  }

  isMinter$(): Observable<boolean> {
    return this.canMint$.asObservable();
  }

  transfer$(
    proof: Proof,
    toHash: string,
    value: number
  ): Observable<any> {
    return this.accountService.getAccount$().pipe(
      mergeMap((courseAddress) => {
        console.log("Transfering", { toHash, value });
        const transfer = this.zkToken.methods
          .transfer(
            proof.proof.a,
            proof.proof.b,
            proof.proof.c,
            proof.inputs,
            toHash,
            value
          )
          .send({ from: courseAddress, gas: 3000000 });
        return from(transfer);
      }),
      first()
    )

  }

  mint$(toHash: string, value: number): Observable<any> {
    return this.accountService.getAccount$().pipe(
      mergeMap((courseAddress) => {
        console.log("Minting", { toHash, value });
        const mint = this.zkToken.methods
          .mint(toHash, value)
          .send({ from: courseAddress });
        return from(mint);
      }), 
      first()
    );
  }

  private fetchTransfers() {
    if (!this.identityHash) {
      return;
    }

    zip(
      from(
        this.zkToken.getPastEvents("Transfer", {
          filter: { from: this.identityHash! },
          fromBlock: 0,
          toBlock: "latest",
        })
      ),
      from(
        this.zkToken.getPastEvents("Transfer", {
          filter: { to: this.identityHash! },
          fromBlock: 0,
          toBlock: "latest",
        })
      )
    )
      .pipe(
        map(([outgoingEvents, incomingEvents]) => {
          const outgoingTransfers = outgoingEvents.map((event) => {
            const transfer = event.returnValues as Transfer;
            transfer.blockNumber = event.blockNumber;
            return transfer;
          });
          const incomingTransfers = incomingEvents.map((event) => {
            const transfer = event.returnValues as Transfer;
            transfer.blockNumber = event.blockNumber;
            return transfer;
          });

          const transfers = [...outgoingTransfers, ...incomingTransfers];
          return transfers.sort((t1, t2) => t2.blockNumber - t1.blockNumber);
        }),
        first()
      )
      .subscribe((transfers) => {
        this.transfers$.next(transfers);
      });
  }

  private fetchBalance() {
    if (!this.identityHash) {
      return;
    }

    this.accountService
      .getAccount$()
      .pipe(
        mergeMap((courseAddress) => {
          const balance = this.zkToken.methods
            .balanceOf(this.identityHash!)
            .call({ from: courseAddress });
          return from(balance as Promise<string>);
        }),
        map((balanceString) => parseInt(balanceString)),
        first()
      )
      .subscribe((balance) => {
        this.balance$.next(balance);
      });
  }

  private fetchTransferCount() {
    if (!this.identityHash) {
      return;
    }

    this.accountService
      .getAccount$()
      .pipe(
        mergeMap((courseAddress) => {
          const transactionCount = this.zkToken.methods
            .transferCountOf(this.identityHash!)
            .call({ from: courseAddress });
          return from(transactionCount as Promise<string>);
        }),
        map((transactionCountString) => parseInt(transactionCountString)),
        first()
      )
      .subscribe((transferCount) => {
        this.transferCount$.next(transferCount);
      });
  }

  private fetchIsMinter() {
    this.accountService
      .getAccount$()
      .pipe(
        mergeMap((courseAddress) => {
          const canMint = this.zkToken.methods.isMinter(courseAddress).call();
          return from(canMint as Promise<boolean>);
        }),
        first()
      )
      .subscribe((canMint) => {
        this.canMint$.next(canMint);
      });
  }
}
