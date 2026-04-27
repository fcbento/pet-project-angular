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
  
  // Controle de Refresh para recarregar dados após salvar meta
  private readonly refreshTrigger = signal<number>(0);
  
  // Controle do Modal
  public readonly isGoalModalOpen = signal<boolean>(false);
  public readonly newGoalValue = signal<number>(0);

  // Range de datas fixo para o resumo (mês atual)
  private readonly dateRange = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    return { start, end };
  });

  // Converte o trigger e dateRange em um Observable para fazer o switchMap
  public readonly summary = toSignal(
    toObservable(computed(() => ({ trigger: this.refreshTrigger(), range: this.dateRange() }))).pipe(
      switchMap(({ range }) => {
        return this.gestaoService.getSummary(range.start, range.end).pipe(
          map(res => res.data),
          catchError(() => of(null))
        );
      })
    ),
    { initialValue: null as ManagementResponse | null }
  );

  public openEditGoal(): void {
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
        this.refreshTrigger.update(v => v + 1); // Força recarregamento do resumo
      },
      error: (err) => console.error('Erro ao salvar meta:', err)
    });
  }
}
