import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Identity } from '../models/identity';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private encoder: TextEncoder;
  private identityKey = 'identity';

  private currentIdentity$ = new BehaviorSubject<Identity | undefined>(
    undefined
  );

  constructor() {
    this.encoder = new TextEncoder();
    this.fetchIdentity();
  }

  private fetchIdentity() {
    const identityString = localStorage.getItem(this.identityKey);
    if (identityString) {
      this.currentIdentity$.next(JSON.parse(identityString));
    }
  }

  getIdentity$(): Observable<Identity> {
    return this.currentIdentity$.pipe(
      filter((identity) => !!identity)
    ) as Observable<Identity>;
  }

  hasIdentity$(): Observable<boolean> {
    return this.currentIdentity$.pipe(
      map((identity) => identity !== undefined)
    );
  }

  resetIdentity() {
    localStorage.removeItem(this.identityKey);
    this.currentIdentity$.next(undefined);
  }

  setIdentity(secretPreimage: string) {
    const encodedUserInput = this.encoder.encode(secretPreimage);
    this.sha256(encodedUserInput).then((secret) => {
      this.sha256(secret).then((hash) => {
        const identity: Identity = {
          secret: this.arrayBufferToHexString(secret),
          hash: this.arrayBufferToHexString(hash),
          secretPreimage,
        };
        localStorage.setItem(this.identityKey, JSON.stringify(identity));
        this.currentIdentity$.next(identity);
      });
    });
  }

  private async sha256(message: Uint8Array): Promise<Uint8Array> {
    const arrayBuffer = await crypto.subtle.digest('SHA-256', message);
    return new Uint8Array(arrayBuffer);
  }

  private arrayBufferToHexString(byteArray: Uint8Array): string {
    const array = new Array(32);
    for (let i = 0; i < 32; i++) {
      array[i] = byteArray[i];
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    return '0x' + array.map((x) => x.toString(16).padStart(2, '0')).join('');
  }
}
