import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutHttpService } from '@backend';
import { EDeliveryType } from '@models/data';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, DecimalPipe, ReactiveFormsModule,
    StepperModule, SelectButtonModule, FloatLabelModule, InputTextModule, InputMaskModule,
    TextareaModule, ButtonModule, CardModule, DividerModule, ToastModule, MessageModule,
  ],
  providers: [MessageService],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage implements OnInit {
  readonly cart = inject(CartService);
  private readonly checkoutHttp = inject(CheckoutHttpService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  isSubmitting = false;
  errorMessage: string | null = null;

  readonly deliveryOptions = [
    { label: 'Курьер',    value: EDeliveryType.Courier, icon: 'pi pi-truck' },
    { label: 'Самовывоз', value: EDeliveryType.Pickup,  icon: 'pi pi-box'  },
  ];

  readonly form = this.fb.group({
    deliveryType:  [EDeliveryType.Courier, Validators.required],
    recipientName: ['', [Validators.required, Validators.minLength(2)]],
    phone:         ['', Validators.required],
    address:       ['', Validators.required],
    comment:       [''],
  });

  ngOnInit(): void {
    this.cart.load();
    this.form.get('deliveryType')!.valueChanges.subscribe(type => {
      const addr = this.form.get('address')!;
      if (type === EDeliveryType.Pickup) {
        addr.clearValidators();
        addr.reset('');
      } else {
        addr.setValidators(Validators.required);
      }
      addr.updateValueAndValidity();
    });
  }

  get isCourier(): boolean {
    return this.form.get('deliveryType')?.value === EDeliveryType.Courier;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = null;
    const v = this.form.value;

    this.checkoutHttp.checkout$({
      delivery: {
        type:          v.deliveryType ?? EDeliveryType.Courier,
        recipientName: v.recipientName ?? '',
        phone:         v.phone ?? '',
        address:       v.address ?? undefined,
        comment:       v.comment ?? undefined,
      },
    }).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res?.isSuccess) {
          this.cart.clear();
          this.messageService.add({ severity: 'success', summary: 'Заказ оформлен!', detail: `№ ${res.data!.orderId.slice(0, 8)}`, life: 5000 });
          setTimeout(() => this.router.navigate(['/orders']), 1500);
        } else {
          this.errorMessage = res?.message ?? 'Ошибка оформления заказа';
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err?.message ?? 'Ошибка оформления заказа';
      },
    });
  }
}
