import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, zip, BehaviorSubject } from 'rxjs';
import { initialize, Proof, ZoKratesProvider } from 'zokrates-js';
import { Identity } from '../models/identity';

@Injectable({
  providedIn: 'root',
})
export class ZokratesService {
  private keypair: any = undefined;
  private artifacts: any;
  private source: string = "";
  private zokratesProvider!: ZoKratesProvider;
  private loadingText$ = new BehaviorSubject("Initializing Zokrates");

  constructor(private http: HttpClient) {
    initialize().then((zokratesProvider) => {
      this.zokratesProvider = zokratesProvider;
      console.log("Zokrates initialized");
      this.loadingText$.next("Compiling zk-SNARK");
      setTimeout(() => {
        this.artifacts = this.zokratesProvider.compile(this.source);
        this.loadingText$.next("");
      }, 10);
      // TODO use web worker to keep UI from freezing
    });

    this.http.get('assets/knowledge_proof.zok', { responseType: 'text' })
    .subscribe((source: any) => {
      console.log("Source loaded");
      this.source = source;
    }),

    zip(
      this.http.get('assets/verification.key', { responseType: 'json' }),
      this.http.get('assets/proving.key', { responseType: 'arraybuffer' })
    ).subscribe(([verificationKey, provingKey]) => {
      console.log("Keys loaded");
      this.keypair = { vk: verificationKey, pk: new Uint8Array(provingKey) };
    });

  }

  public getLoadingText$(): Observable<string> {
    return this.loadingText$.asObservable();
  }

  public generateProof(identity: Identity, transferCount: number): Proof {
    const secret = this.splitStringToLength(identity.secret.substring(2), 8);
    const hash = this.splitStringToLength(identity.hash.substring(2), 8);
    const transferCountString = transferCount.toString(16).padStart(64, '0');
    const countNullifier = this.splitStringToLength(transferCountString, 8);
    const input = [secret, hash, countNullifier];
    console.log('Computing witness and proof for', input);
    const { witness, output } = this.zokratesProvider.computeWitness(
      this.artifacts,
      input
    );
    return this.zokratesProvider.generateProof(
      this.artifacts.program,
      witness,
      this.keypair.pk
    );
  }

  private splitStringToLength(str: string, length: number): string[] {
    const strArray = str.match(new RegExp('.{1,' + length + '}', 'g'));
    return strArray!.map((entry) => '0x' + entry);
  }
}
