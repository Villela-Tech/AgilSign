import jsPDF from 'jspdf';

interface TermoRecebimentoData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  equipamento?: string;
  numeroSerie?: string;
  equipe?: string;
  assinatura?: string;
  data?: string;
  responsavel?: string;
  patrimonio?: string;
}

export const generateTermoRecebimento = (data: TermoRecebimentoData) => {
  const doc = new jsPDF();

  // Configurações de fonte
  doc.setFont('helvetica');
  doc.setFontSize(12);

  // Nome da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VILLELA TECH', 105, 20, { align: 'center' });

  // Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Porto Alegre, ${data.data || new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });

  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Termo de Recebimento', 105, 50, { align: 'center' });

  // Texto introdutório
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Declaro ter recebido no dia de hoje, o equipamento descrito abaixo em perfeitas condições de uso.', 20, 70);

  // Detalhes do equipamento
  doc.setFontSize(12);
  doc.text('Equipamento:', 20, 90);
  doc.rect(20, 92, 170, 10);
  doc.text(data.equipamento || '', 25, 99);

  // Número de Série
  doc.text('Número de Série:', 20, 110);
  doc.rect(20, 112, 170, 10);
  doc.text(data.numeroSerie || '', 25, 119);

  // Patrimônio (opcional)
  let currentY = 130;
  if (data.patrimonio) {
    doc.text('Patrimônio:', 20, currentY);
    doc.rect(20, currentY + 2, 170, 10);
    doc.text(data.patrimonio || '', 25, currentY + 9);
    currentY += 20;
  }

  // Responsável
  doc.text(`Equipamento entregue por ${data.responsavel || 'Arthur Pomiecinski'}.`, 20, currentY);
  
  // Data de assinatura
  if (data.assinatura) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Data de assinatura: ${data.data}`, 20, currentY + 10);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.text(`Data de recebimento: ${data.data}`, 20, currentY + 10);
  }

  // Nome do responsável
  doc.text(`${data.nome || ''} ${data.sobrenome || ''}`.trim(), 3, 210);

  // Assinatura
  if (data.assinatura) {
    doc.addImage(data.assinatura, 'PNG', 20, 217, 50, 30);
  }
  doc.text('Assinatura:', 2, 230);
  doc.line(25, 232, 70, 232);

  return doc;
}; 