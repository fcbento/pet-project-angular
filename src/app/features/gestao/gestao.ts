import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { Modal } from '../../ui/modal/modal';
import { FormInput } from '../../ui/form-input/form-input';
import { Button } from '../../ui/button/button';
import { GestaoService, ManagementResponse } from './gestao.service';

@Component({
  selector: 'app-gestao',
  standalone: true,
  imports: [CommonModule, Modal, FormInput, Button],
  templateUrl: './gestao.html',
  styleUrl: './gestao.scss',
})
export class Gestao {
  private readonly gestaoService = inject(GestaoService);
  public readonly String = String;
  
  // Controle de Refresh
  private readonly refreshTrigger = signal<number>(0);
  
  // Controle do Modal
  public readonly isGoalModalOpen = signal<boolean>(false);
  public readonly newGoalValue = signal<number>(0);

  // Filtros de Data
  public readonly selectedPeriod = signal<string>('Mês Atual');
  public readonly startDate = signal<string>(this.getDefaultStartDate());
  public readonly endDate = signal<string>(this.getDefaultEndDate());

  public readonly isMonthlyView = computed(() => {
    return this.selectedPeriod() === 'Mês Atual' || this.selectedPeriod() === 'Mês Anterior';
  });

  private getDefaultStartDate(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  public setPeriod(period: string): void {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    this.selectedPeriod.set(period);

    switch (period) {
      case 'Mês Atual':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'Mês Anterior':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case '3 Meses':
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case '6 Meses':
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case '12 Meses':
        start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'Ano Atual':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    this.startDate.set(start.toISOString().split('T')[0]);
    this.endDate.set(end.toISOString().split('T')[0]);
  }

  public setString(sig: any, val: string | number | null): void {
    if (val !== null) sig.set(String(val));
  }

  // Resumo Reativo
  public readonly summary = toSignal(
    toObservable(computed(() => ({ 
      trigger: this.refreshTrigger(), 
      start: this.startDate(), 
      end: this.endDate() 
    }))).pipe(
      switchMap(({ start, end }) => {
        const startTime = `${start}T00:00:00.000Z`;
        const endTime = `${end}T23:59:59.999Z`;
        
        return this.gestaoService.getSummary(startTime, endTime).pipe(
          map(res => res.data),
          catchError(() => of(null))
        );
      })
    ),
    { initialValue: null as ManagementResponse | null }
  );

  public loadSummary(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  public openGoalModal(): void {
    const currentGoal = this.summary()?.monthlyGoal || 0;
    this.newGoalValue.set(currentGoal);
    this.isGoalModalOpen.set(true);
  }

  public saveGoal(): void {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const value = this.newGoalValue();

    this.gestaoService.saveGoal(month, year, value).subscribe({
      next: () => {
        this.isGoalModalOpen.set(false);
        this.refreshTrigger.update(v => v + 1);
      },
      error: (err) => console.error('Erro ao salvar meta:', err)
    });
  }
}
