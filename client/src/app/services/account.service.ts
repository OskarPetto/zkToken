import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import Web3 from 'web3';
import { environment } from '../../environments/environment';
import zkTokenAbi from '../../assets/ZKToken.json';
import { AbiItem } from 'web3-utils';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private web3;
  private account$ = new BehaviorSubject<string | undefined>(undefined);
  private accounts$ = new BehaviorSubject<string[]>([]);
  private contract;
  private accountKey = "account";

  constructor() {
    const provider = environment.provider; // Web3.givenProvider || environment.provider;
    console.log('Using provider', provider);
    this.web3 = new Web3(provider);
    this.contract = new this.web3.eth.Contract(
      zkTokenAbi.abi as unknown as AbiItem,
      environment.zktoken
    );

    this.fetchAccounts();
  }


  private fetchAccounts() {
    this.web3.eth.getAccounts().then((accounts) => {
      this.accounts$.next(accounts);
      const account = localStorage.getItem(this.accountKey);
      if (account) {
        this.setAccount(account);
      } else {
        this.setAccount(accounts[0]);
      }
    });
  }

  public setAccount(account: string): Observable<any> {
    return from(this.web3.eth.personal
    .unlockAccount(account, 'logic', 7200)
    .then((_) => {
      this.account$.next(account);
      localStorage.setItem(this.accountKey, account);
    }));
  }

  public getAccount$(): Observable<string> {
    return this.account$.pipe(
      filter((courseAddress) => !!courseAddress)
    ) as Observable<string>;
  }

  public getAccounts$(): Observable<string[]> {
    return this.accounts$.asObservable();
  }

  public getContract() {
    return this.contract;
  }
}
