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
    return s.ingredients.reduce((acc, curr) => acc + curr.value, 0);
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

  public readonly totalCost = computed(() => this.totalIngredientsCost() + this.totalPackagingCost());

  public readonly unitCost = computed(() => {
    const s = this.sheet();
    const yieldUnits = s?.yieldUnits || 1;
    return this.totalCost() / yieldUnits;
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
