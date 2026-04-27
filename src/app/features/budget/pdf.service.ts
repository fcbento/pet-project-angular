import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable()
export class PdfService {
  
  public generateBudgetPdf(items: any[], totalBudget: number) {
    const doc = new jsPDF();
    const logoUrl = 'logo.png'; 

    const img = new Image();
    img.src = logoUrl;
    
    img.onload = () => {
      this.buildPdf(doc, img, items, totalBudget);
    };

    img.onerror = () => {
      console.warn('Não foi possível carregar a logo, gerando PDF sem imagem.');
      this.buildPdf(doc, null, items, totalBudget);
    };
  }

  private buildPdf(doc: jsPDF, logoImg: HTMLImageElement | null, items: any[], totalBudget: number) {
    // Cabeçalho
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 10, 10, 30, 30);
    }
    
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('Orçamento - Casa Gelada', 50, 25);
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 32);
    doc.text('Casa Gelada ERP - O seu controle de lucro.', 50, 37);

    // Linha separadora
    doc.setDrawColor(200);
    doc.line(10, 45, 200, 45);

    // Tabela de Itens (sem a coluna de lucro)
    const tableData = items.map(item => [
      item.name,
      item.quantity.toString(),
      this.formatCurrency(item.sellPrice),
      this.formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 123, 255] }, 
      foot: [['', '', 'TOTAL GERAL:', this.formatCurrency(totalBudget)]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Casa Gelada ERP - Gerado em ${new Date().toLocaleString()}`,
        10,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`orcamento_casagelada_${Date.now()}.pdf`);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
