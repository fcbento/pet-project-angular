import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { Button } from '../../../../ui/button/button';
import { TechnicalSheetService } from '../technical-sheet.service';
import { TechnicalSheetResponse } from '../technical-sheet.models';

@Component({
  selector: 'app-technical-sheet-details',
  imports: [CommonModule, CurrencyPipe, Button],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class TechnicalSheetDetails {
  private readonly service = inject(TechnicalSheetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly productId = signal<number>(Number(this.route.snapshot.paramMap.get('id')));

  public readonly sheetResource = rxResource({
    stream: () => this.service.getByProductId(this.productId())
  });

  public readonly sheet = computed<TechnicalSheetResponse | undefined>(() => {
    if (this.sheetResource.error()) return undefined;
    return this.sheetResource.value() ?? undefined;
  });

  public readonly hasSheet = computed(() => !!this.sheet());

  public readonly totalIngredientsCost = computed(() => {
    const s = this.sheet();
    if (!s) return 0;
    return s.ingredients.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
  });

  public readonly totalPackagingCost = computed(() => {
    const s = this.sheet();
    if (!s) return 0;
    const pkg = s.packaging;
    return (
      (pkg.stickCost || 0) +
      (pkg.brandLabelCost || 0) +
      (pkg.flavorLabelCost || 0) +
      (pkg.bagCost || 0) +
      (pkg.paperPackagingCost || 0)
    );
  });

  public readonly fixedOperationalCost = computed(() => this.sheet()?.fixedOperationalCost || 0);

  public readonly totalCost = computed(() => {
    const s = this.sheet();
    if (!s) return 0;
    const yieldUnits = s.yieldUnits || 1;
    return this.totalIngredientsCost() + this.totalPackagingCost() + (this.fixedOperationalCost() * yieldUnits);
  });

  public readonly unitCost = computed(() => {
    const s = this.sheet();
    if (!s) return 0;
    const yieldUnits = s.yieldUnits || 1;
    return (this.totalIngredientsCost() + this.totalPackagingCost()) / yieldUnits + this.fixedOperationalCost();
  });

  public readonly sellPrice = computed(() => this.sheet()?.sellPrice || 0);
  public readonly ifoodSellPrice = computed(() => this.sheet()?.ifoodSellPrice || 0);

  public readonly profit = computed(() => this.sellPrice() - this.unitCost());
  public readonly profitMargin = computed(() => {
    const sell = this.sellPrice();
    return sell > 0 ? (this.profit() / sell) * 100 : 0;
  });

  public readonly ifoodProfit = computed(() => {
    const ifoodPrice = this.ifoodSellPrice();
    return ifoodPrice > 0 ? (ifoodPrice * 0.72) - this.unitCost() : 0;
  });
  public readonly ifoodProfitMargin = computed(() => {
    const ifoodPrice = this.ifoodSellPrice();
    const ifoodNetRevenue = ifoodPrice * 0.72;
    return ifoodNetRevenue > 0 ? (this.ifoodProfit() / ifoodNetRevenue) * 100 : 0;
  });

  // Resale Signals
  public readonly hasResale = computed(() => this.sheet()?.hasResale || false);
  public readonly resalePrice = computed(() => this.sheet()?.resalePrice || 0);

  public readonly resaleProfitUnit = computed(() => this.resalePrice() - this.unitCost());
  public readonly resaleMargin = computed(() => {
    const price = this.resalePrice();
    return price > 0 ? (this.resaleProfitUnit() / price) * 100 : 0;
  });

  public readonly isLoading = computed(() => this.sheetResource.isLoading());
  public readonly hasError = computed(() => !!this.sheetResource.error());

  public goBack(): void {
    this.router.navigate(['/dashboard/produto']);
  }

  public goToEdit(): void {
    this.router.navigate(['/dashboard/produto/ficha-tecnica'], {
      queryParams: { productId: this.productId() },
    });
  }
}
