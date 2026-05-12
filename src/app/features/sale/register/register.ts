import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Field } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Button } from '../../../ui/button/button';
import { FormDate } from '../../../ui/form-date/form-date';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { ToastModel } from '../../../utility/store/toast/toast.models';
import { ProductService } from '../../product/product.service';
import { CategoryService } from '../../category/category.service';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';
import { ProductResponse } from '../../product/list/list.models';
import { SaleService } from '../sale.service';
import { SaleRegisterForm } from './register.form';
import { SaleItemRequest, SaleOrigin, SaleRequest } from '../sale.models';
import { PackagingService } from '../../packaging/packaging.service';
import { PromocoesService, PromotionResponse } from '../../promocoes/promocoes.service';
import { FormSwitch } from '../../../ui/form-switch/form-switch';

export interface SaleItemDraft {
  productId: number;
  productName: string;
  sellPrice: number;
  quantity: number;
  product: ProductResponse;
  isPromotional?: boolean;
}

@Component({
  selector: 'app-sale-register',
  standalone: true,
  imports: [CommonModule, FormInput, FormDate, FormSelect, FormSwitch, Button, CurrencyPipe, DatePipe, Field, ConfirmDialog],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [SaleRegisterForm],
})
export class SaleRegister {
  private readonly service = inject(SaleService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  public readonly registerForm = inject(SaleRegisterForm);
  public readonly store = inject(Store);
  private readonly packagingService = inject(PackagingService);
  private readonly promocoesService = inject(PromocoesService);

  constructor() {
    effect(() => {
      const origem = this.registerForm.registerForm().value().origem;

      this.saleItems.update((items) => {
        let changed = false;
        const newItems = items.map((item) => {
          const product = item.product;
          if (!product) return item;

          let newPrice = product.sellPrice;

          if (origem === 'IFOOD' && product.ifoodSellPrice) {
            newPrice = product.ifoodSellPrice;
          } else if (origem === 'REVENDA' && product.resalePrice) {
            newPrice = product.resalePrice;
          }

          if (newPrice !== item.sellPrice) {
            changed = true;
            return { ...item, sellPrice: newPrice };
          }
          return item;
        });

        return changed ? newItems : items;
      });
    }, { allowSignalWrites: true });
  }

  // Categories for the select
  public readonly categoryResource = rxResource({
    stream: () => this.categoryService.getAll(),
  });

  public readonly categoryOptions = computed(() => {
    const categories = this.categoryResource.value()?.data || [];
    const products = this.productResource.value()?.data || [];
    const origem = this.registerForm.registerForm().value().origem;

    return categories
      .filter((c) => products.some((p) => p.category?.id == c.id && (origem !== 'REVENDA' || p.hasResale === true)))
      // Combos não são vendidos por revenda
      .filter((c) => !(origem === 'REVENDA' && c.nome === 'Combo'))
      .map((c) => ({
        label: c.nome,
        value: c.id,
      }));
  });

  // Products for the select
  public readonly productResource = rxResource({
    stream: () => this.productService.getAll(),
  });

  public readonly hasProducts = computed(() => {
    return (this.productResource.value()?.data?.length || 0) > 0;
  });

  public readonly origemOptions = signal([
    { label: 'iFood', value: 'IFOOD' },
    { label: 'Balcão', value: 'BALCAO' },
    { label: 'Revenda', value: 'REVENDA' },
  ]);

  // Items State
  public readonly selectedCategoryId = signal<number | null>(null);
  public readonly selectedProductId = signal<number | null>(null);

  public readonly productOptions = computed(() => {
    const products = this.productResource.value()?.data || [];
    const categoryId = this.selectedCategoryId();
    const origem = this.registerForm.registerForm().value().origem;

    return products
      .filter((p) => !categoryId || p.category?.id == categoryId)
      .filter((p) => origem !== 'REVENDA' || p.hasResale === true)
      .map((p) => ({
        label: `${p.name} (Estoque: ${p.stockQuantity ?? 0})`,
        value: p.id,
        product: p,
        disabled: (p.stockQuantity ?? 0) <= 0
      }));
  });
  public readonly selectedQuantity = signal<number>(1);
  public readonly saleItems = signal<SaleItemDraft[]>([]); // items added to the sale

  public readonly isConfirmDialogOpen = signal(false);

  // Promotions State
  public readonly activePromotions = rxResource<PromotionResponse[], unknown>({
    stream: () => this.promocoesService.listActivePromotions()
  });

  public readonly isPromotionalSelection = signal(false);

  public readonly hasPromotionForSelected = computed(() => {
    const productId = this.selectedProductId();
    const origin = this.registerForm.registerForm().value().origem;
    if (!productId || origin === 'REVENDA') return false;

    return this.activePromotions.value()?.some(p => p.productId === productId && p.origin === origin) || false;
  });

  public readonly promotionPrice = computed(() => {
    const productId = this.selectedProductId();
    const origin = this.registerForm.registerForm().value().origem;
    if (!productId || origin === 'REVENDA') return null;

    const promo = this.activePromotions.value()?.find(p => p.productId === productId && p.origin === origin);
    return promo ? promo.promoPrice : null;
  });

  public readonly totalSalePrice = computed(() => {
    return this.saleItems().reduce((acc, curr) => acc + (curr.sellPrice * curr.quantity), 0);
  });

  // Packaging logic
  public readonly packagingResource = rxResource({
    stream: () => this.packagingService.findAll(),
  });

  public readonly ifoodPackagingItems = computed(() => {
    const all = this.packagingResource.value() || [];
    const targetNames = ['Saco Kraft', 'Saco térmico', 'Hamburgueira'];
    return all.filter(p => targetNames.includes(p.name));
  });

  public readonly packagingFee = computed(() => {
    if (this.registerForm.registerForm().value().origem !== 'IFOOD') return 0;

    const items = this.ifoodPackagingItems();
    if (items.length === 0) return 3.0; // Fallback se não encontrar os itens

    return items.reduce((acc, curr) => acc + curr.unitPrice, 0);
  });

  public readonly canAddItem = computed(() => {
    return !!this.selectedProductId() && this.selectedQuantity() > 0;
  });

  public readonly canSubmit = computed(() => {
    const form = this.registerForm.registerForm();
    const hasItems = this.saleItems().length > 0;
    const isFormValid = form.valid();
    const values = form.value();
    const hasOrigem = !!values.origem?.trim();
    const hasDate = !!values.sellDate;

    return hasItems && isFormValid && hasOrigem && hasDate;
  });

  public clearItems(): void {
    this.saleItems.set([]);
  }

  public addItem(): void {
    const productId = this.selectedProductId();
    const quantity = this.selectedQuantity();

    if (!productId || quantity <= 0) {
      this.toast({
        title: 'Erro',
        message: 'Selecione um produto e uma quantidade válida',
        type: 'error',
      });
      return;
    }

    const options = this.productOptions();
    const option = options.find((p) => String(p.value) === String(productId));
    const product = option?.product;

    if (!product) {
      this.toast({
        title: 'Erro',
        message: 'Produto não encontrado',
        type: 'error',
      });
      return;
    }

    const origem = this.registerForm.registerForm().value().origem;

    // Validação de Revenda (US-013)
    if (origem === 'REVENDA') {
      if (product.type === 'COMBO') {
        this.toast({
          title: 'Produto inválido para revenda',
          message: `Combos não podem ser vendidos por revenda.`,
          type: 'warning',
        });
        return;
      }
      if (!product.hasResale || !product.resalePrice || product.resalePrice <= 0) {
        this.toast({
          title: 'Produto não habilitado',
          message: `O produto "${product.name}" não está habilitado para revenda. Você pode habilitá-lo na Ficha Técnica.`,
          type: 'warning',
        });
        return;
      }
    }

    let sellPrice = product.sellPrice;
    const isPromotional = this.isPromotionalSelection();

    if (isPromotional && this.promotionPrice()) {
      sellPrice = this.promotionPrice()!;
    } else {
      if (origem === 'IFOOD' && product.ifoodSellPrice) {
        sellPrice = product.ifoodSellPrice;
      } else if (origem === 'REVENDA' && product.resalePrice) {
        sellPrice = product.resalePrice;
      }
    }

    // Validação de Preço Zerado (US-021)
    if (!sellPrice || sellPrice <= 0) {
      this.toast({
        title: 'Preço não configurado',
        message: `O produto "${product.name}" não possui preço configurado para a origem "${origem}". Configure o preço na Ficha Técnica antes de vender.`,
        type: 'warning',
      });
      return;
    }

    // Validação de Estoque (US-020)
    const existingInCart = this.saleItems().find(i => String(i.productId) === String(productId));
    const totalRequested = (existingInCart?.quantity || 0) + quantity;
    const availableStock = product.stockQuantity ?? 0;

    if (totalRequested > availableStock) {
      this.toast({
        title: 'Estoque insuficiente',
        message: `O produto "${product.name}" possui apenas ${availableStock} em estoque. (Você já tem ${existingInCart?.quantity || 0} no carrinho)`,
        type: 'warning',
      });
      return;
    }

    this.saleItems.update((items) => {
      const existing = items.find((i) => String(i.productId) === String(productId));
      if (existing) {
        existing.quantity += quantity;
        return [...items];
      }
      return [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          sellPrice: sellPrice,
          quantity,
          product,
          isPromotional
        },
      ];
    });

    // Reset item form
    this.selectedProductId.set(null);
    this.selectedQuantity.set(1);
    this.isPromotionalSelection.set(false);
  }

  public removeItem(index: number): void {
    this.saleItems.update((items) => {
      items.splice(index, 1);
      return [...items];
    });
  }

  public submit(): void {
    const form = this.registerForm.registerForm;
    form().markAsTouched();

    if (!form().valid() || !form().value().origem?.trim() || !form().value().sellDate) {
      this.toast({
        title: 'Dados incompletos',
        message: 'Preencha os campos obrigatórios (Origem e Data)',
        type: 'error',
      });
      return;
    }

    if (this.saleItems().length === 0) {
      this.toast({
        title: 'Sem itens',
        message: 'A venda deve possuir pelo menos um produto',
        type: 'error',
      });
      return;
    }

    this.isConfirmDialogOpen.set(true);
  }

  public executeSave(): void {
    const form = this.registerForm.registerForm;
    this.isConfirmDialogOpen.set(false);
    this.registerForm.isSubmitting.set(true);

    // Fix para evitar inversão de data (US-031/BUG-03)
    // Converte YYYY-MM-DD para um objeto Date local antes de enviar como ISO
    const dateStr = form().value().sellDate; // Formato YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar shifts de fuso
    
    const payload: SaleRequest = {
      origem: form().value().origem as SaleOrigin,
      sellDate: localDate.toISOString(),
      items: this.saleItems().map((i): SaleItemRequest => ({
        productId: i.productId,
        quantity: i.quantity,
        isPromotional: i.isPromotional
      })),
      packagingFee: this.packagingFee(),
    };

    this.service.create(payload).subscribe({
      next: () => {
        this.toast({
          title: 'Sucesso ao cadastrar venda',
          message: 'Venda cadastrada com sucesso',
          type: 'success',
          duration: 1000,
        });
        this.registerForm.resetForm();
        this.saleItems.set([]);
        this.router.navigate(['/dashboard/venda']);
      },
      error: () => {
        this.toast({
          title: 'Erro ao cadastrar venda',
          message: 'Erro ao cadastrar venda',
          type: 'error',
        });
      },
      complete: () => {
        this.registerForm.isSubmitting.set(false);
      },
    });
  }

  private toast(toast: ToastModel): void {
    this.store.dispatch(new OpenToast(toast));
  }

  public cancel(): void {
    this.router.navigate(['/dashboard/venda']);
  }
}
