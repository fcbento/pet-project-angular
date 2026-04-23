import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { FormItems } from '../../../../utility/models/form-items.model';

export interface TechnicalSheetModel {
    yieldUnits: number;
    yieldWeight: number;
    storage: string;
    validity: string;
    // Packaging
    stickCost: number;
    brandLabelCost: number;
    flavorLabelCost: number;
    bagCost: number;
    paperPackagingCost: number;
    packagingType: 'PAPEL' | 'SAQUINHO';
    // Pricing
    sellPrice: number;
    ifoodSellPrice: number;
}

@Injectable()
export class TechnicalSheetForm {
    private readonly initialModel: TechnicalSheetModel = {
        yieldUnits: 1,
        yieldWeight: 0,
        storage: '',
        validity: '',
        stickCost: 0,
        brandLabelCost: 0,
        flavorLabelCost: 0,
        bagCost: 0,
        paperPackagingCost: 0,
        packagingType: 'SAQUINHO',
        sellPrice: 0,
        ifoodSellPrice: 0,
    };

    private readonly model = signal<TechnicalSheetModel>(this.initialModel);

    public readonly isSubmitting = signal(false);

    public readonly registerForm = form(this.model, (schemaPath) => {
        required(schemaPath.yieldUnits, { message: 'Rendimento é obrigatório' });
    });

    public readonly packagingFormItems = signal<FormItems[]>([
        {
            placeholder: 'Custo Palito',
            label: 'Custo Palito',
            type: 'number',
            field: this.registerForm.stickCost,
        },
        {
            placeholder: 'Custo Etiqueta Marca',
            label: 'Custo Etiqueta Marca',
            type: 'number',
            field: this.registerForm.brandLabelCost,
        },
        {
            placeholder: 'Custo Etiqueta Sabor',
            label: 'Custo Etiqueta Sabor',
            type: 'number',
            field: this.registerForm.flavorLabelCost,
        },
        {
            placeholder: 'Custo Saquinho',
            label: 'Custo Saquinho',
            type: 'number',
            field: this.registerForm.bagCost,
        },
        {
            placeholder: 'Custo Embalagem Papel',
            label: 'Custo Embalagem Papel',
            type: 'number',
            field: this.registerForm.paperPackagingCost,
        },
    ]);

    public resetForm(): void {
        this.registerForm().reset(this.initialModel);
    }

    public patchIfoodPrice(price: number): void {
        this.model.update((m) => ({ ...m, ifoodSellPrice: price }));
    }
}
