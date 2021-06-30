import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ZKTokenService } from 'src/app/services/zktoken.service';

@Component({
  selector: 'zk-minter',
  templateUrl: './minter.component.html',
  styleUrls: ['./minter.component.scss']
})
export class MinterComponent implements OnInit {

  isMinter$;

  mintForm = this.formBuilder.group({
    toHash: new FormControl(
      '', [Validators.required, Validators.minLength(64), Validators.maxLength(64)]
    ), 
    value: new FormControl(
      0, [Validators.required]
    ),
  });

  constructor(private zkTokenService: ZKTokenService, 
    private formBuilder: FormBuilder
    ) { 
    this.isMinter$ = this.zkTokenService.isMinter$();
  }

  ngOnInit(): void {

  }

  submitMint() {
    const toHash = '0x' + this.mintForm.value.toHash;
    const value = this.mintForm.value.value;
    this.zkTokenService.mint$(toHash, value).subscribe();
  }

  get toHashFormControl() {
    return this.mintForm.get('toHash');
  }

}
