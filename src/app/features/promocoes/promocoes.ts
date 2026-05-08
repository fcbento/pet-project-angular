import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionRegister } from './promotion-register/promotion-register';
import { ComboRegister } from './combo-register/combo-register';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product/product.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-promocoes',
  standalone: true,
  imports: [CommonModule, PromotionRegister, ComboRegister],
  templateUrl: './promocoes.html',
  styleUrl: './promocoes.scss'
})
export class Promocoes {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  
  public readonly activeTab = signal<'promocoes' | 'combos'>('promocoes');

  public readonly productsResource = rxResource({
    stream: () => this.productService.getAll().pipe(map(r => r.data || []))
  });

  public readonly hasProducts = computed(() => (this.productsResource.value()?.length || 0) > 0);

  constructor() {
    effect(() => {
      const tab = this.route.snapshot.queryParamMap.get('tab');
      if (tab === 'combos') {
        this.activeTab.set('combos');
      }
    });
  }

  public setTab(tab: 'promocoes' | 'combos'): void {
    this.activeTab.set(tab);
  }
}
