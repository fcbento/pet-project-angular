import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { ProductResponse } from '../product/list/list.models';
import { CategoryResponse } from '../category/list/list.models';
import { PdfService } from './pdf.service';
import { Button } from '../../ui/button/button';

interface BudgetItem {
  id: number;
  name: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  total: number;
  profit: number;
  margin: number;
  markup: number;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, Button],
  templateUrl: './budget.html',
  styleUrl: './budget.scss',
  providers: [PdfService]
})
export class Budget {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly pdfService = inject(PdfService);

  // Form Signals
  public selectedCategoryId = signal<number | null>(null);
  public selectedProductId = signal<number | null>(null);
  public quantity = signal<number>(1);
  public customSellPrice = signal<number>(0);

  // Data Resources
  public categoriesResource = rxResource({
    stream: () => this.categoryService.getAll().pipe(map(r => r.data || [])),
  });

  public allProductsResource = rxResource({
    stream: () => this.productService.getAll().pipe(map(r => r.data || [])),
  });

  public productsResource = rxResource({
    stream: () => {
      const categoryId = this.selectedCategoryId();
      if (!categoryId) return of([] as ProductResponse[]);
      return this.productService.getByCategory(categoryId).pipe(
        map(r => (r.data || []).filter(p => p.hasResale === true))
      );
    }
  });

  // Computed for categories that have products
  public availableCategories = computed(() => {
    const categories = (this.categoriesResource.value() || []) as CategoryResponse[];
    const products = (this.allProductsResource.value() || []) as ProductResponse[];
    
    // Get unique category IDs that have products
    const categoryIdsWithProducts = new Set(
      products
        .filter((p: ProductResponse) => p.hasResale === true)
        .map((p: ProductResponse) => p.category?.id)
    );
    
    return categories.filter((c: CategoryResponse) => categoryIdsWithProducts.has(c.id));
  });

  public selectedProduct = computed(() => {
    const productId = this.selectedProductId();
    const products = this.productsResource.value() || [];
    return products.find((p: ProductResponse) => p.id === productId);
  });

  // Calculations for current item in form
  public currentCostPrice = computed(() => this.selectedProduct()?.costPrice || 0);
  
  public minBudgetPrice = computed(() => {
    const cost = this.currentCostPrice();
    return cost > 0 ? Math.round((cost / 0.8) * 100) / 100 : 0;
  });

  public maxBudgetPrice = computed(() => {
    const cost = this.currentCostPrice();
    return cost > 0 ? Math.round((cost / 0.75) * 100) / 100 : 0;
  });
  
  public currentMargin = computed(() => {
    const revenda = this.customSellPrice();
    const custo = this.currentCostPrice();
    if (revenda <= 0) return 0;
    return ((revenda - custo) / revenda) * 100;
  });

  public currentMarkup = computed(() => {
    const revenda = this.customSellPrice();
    const custo = this.currentCostPrice();
    if (custo <= 0) return 0;
    return revenda / custo;
  });

  public currentTotal = computed(() => this.quantity() * this.customSellPrice());
  public currentProfit = computed(() => (this.customSellPrice() - this.currentCostPrice()) * this.quantity());

  public isPriceOutsideMargin = computed(() => {
    const price = this.customSellPrice();
    if (price === 0) return false;
    const min = this.minBudgetPrice();
    const max = this.maxBudgetPrice();
    return price < min || price > max;
  });

  // Budget List
  public items = signal<BudgetItem[]>([]);
  public totalBudget = computed(() => this.items().reduce((acc, item) => acc + item.total, 0));
  public totalProfit = computed(() => this.items().reduce((acc, item) => acc + item.profit, 0));

  public onCategoryChange() {
    this.selectedProductId.set(null);
    this.customSellPrice.set(0);
    this.quantity.set(1);
    this.productsResource.reload();
  }

  public onProductChange() {
    const product = this.selectedProduct();
    if (product) {
      this.customSellPrice.set(product.resalePrice || 0);
    } else {
      this.customSellPrice.set(0);
    }
  }

  public addItem() {
    const product = this.selectedProduct();
    if (!product || this.customSellPrice() <= 0 || this.quantity() <= 0) return;

    const newItem: BudgetItem = {
      id: product.id,
      name: product.name,
      quantity: this.quantity(),
      costPrice: this.currentCostPrice(),
      sellPrice: this.customSellPrice(),
      total: this.currentTotal(),
      profit: this.currentProfit(),
      margin: this.currentMargin(),
      markup: this.currentMarkup()
    };

    this.items.update(prev => [...prev, newItem]);
    
    // Reset form for next item
    this.selectedProductId.set(null);
    this.quantity.set(1);
    this.customSellPrice.set(0);
  }

  public removeItem(index: number) {
    this.items.update(prev => prev.filter((_, i) => i !== index));
  }

  public generatePdf() {
    this.pdfService.generateBudgetPdf(this.items(), this.totalBudget());
  }

  public exportProducts() {
    const products = this.allProductsResource.value() || [];
    this.pdfService.generateProductListPdf(products);
  }
}
