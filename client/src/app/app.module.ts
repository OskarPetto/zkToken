import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { IdentityChooserComponent } from './components/identity-chooser/identity-chooser.component';
import { IdentityOverviewComponent } from './components/identity-overview/identity-overview.component';
import { TransferHistoryComponent } from './components/transfer-history/transfer-history.component';
import { CreateTransferComponent } from './components/create-transfer/create-transfer.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { HttpClientModule } from '@angular/common/http';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MinterComponent } from './components/minter/minter.component';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    IdentityChooserComponent,
    IdentityOverviewComponent,
    TransferHistoryComponent,
    CreateTransferComponent,
    MinterComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatButtonModule, 
    MatSlideToggleModule, 
    HttpClientModule, 
    MatProgressSpinnerModule, 
    MatDialogModule, 
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
