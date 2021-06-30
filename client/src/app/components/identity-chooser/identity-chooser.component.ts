import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IdentityService } from 'src/app/services/identity.service';

@Component({
  selector: 'zk-identity-chooser',
  templateUrl: './identity-chooser.component.html',
  styleUrls: ['./identity-chooser.component.scss']
})
export class IdentityChooserComponent implements OnInit {

  secretPreimageForm = this.formBuilder.group({
    secretPreimage: new FormControl(
      '', [Validators.required, Validators.minLength(5)]
    )
  });

  constructor(private identityService: IdentityService, 
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  submitUserInput() {
    this.identityService.setIdentity(this.secretPreimageForm.value.secretPreimage);
  }

  get secretPreimageFormControl() {
    return this.secretPreimageForm.get('secretPreimage')!;
  }
}
