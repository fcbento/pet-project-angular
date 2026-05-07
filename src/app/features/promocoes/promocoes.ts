import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionRegister } from './promotion-register/promotion-register';
import { ComboRegister } from './combo-register/combo-register';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-promocoes',
  standalone: true,
  imports: [CommonModule, PromotionRegister, ComboRegister],
  templateUrl: './promocoes.html',
  styleUrl: './promocoes.scss'
})
export class Promocoes {
  private readonly route = inject(ActivatedRoute);
  public readonly activeTab = signal<'promocoes' | 'combos'>('promocoes');

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
