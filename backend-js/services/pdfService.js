const { jsPDF } = require('jspdf');

const generateTermoRecebimento = async (data) => {
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 25;
  const marginRight = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 30;

  // Adicionar logo Villela Tech
  doc.addImage('path/to/villela-tech-logo.png', 'PNG', marginLeft, currentY - 10, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('VILLELA', marginLeft + 35, currentY);
  doc.text('TECH', marginLeft + 35, currentY + 7);
  
  // Data
  doc.setFontSize(10);
  doc.text('Porto Alegre, 20 de fevereiro de 2025', pageWidth / 2, currentY + 30, { align: 'center' });
  currentY += 60;

  // Título
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Termo de Recebimento', pageWidth / 2, currentY, { align: 'center' });
  currentY += 30;

  // Texto introdutório
  doc.setFont('helvetica', 'normal');
  const introText = 'Declaro ter recebido no dia de hoje, o equipamento descrito abaixo em perfeitas condições de uso.';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginLeft, currentY);
  currentY += splitIntro.length * 7 + 20;

  // Tabela de equipamento
  const tableHeaders = ['Equipamento:', 'Número de série', 'Equipe:', 'Usuário:'];
  const tableData = [
    data.equipamento || '',
    data.numeroSerie || '',
    data.equipe || '',
    `${data.nome || ''} ${data.sobrenome || ''}`.trim()
  ];
  
  // Desenhar tabela
  const cellHeight = 10;
  const cellPadding = 3;
  const tableWidth = contentWidth;
  const colWidth = tableWidth / 4;
  
  // Cabeçalho da tabela
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  
  tableHeaders.forEach((header, i) => {
    doc.rect(marginLeft + (i * colWidth), currentY, colWidth, cellHeight, 'FD');
    doc.text(header, marginLeft + (i * colWidth) + cellPadding, currentY + 7);
  });
  
  // Dados da tabela
  currentY += cellHeight;
  tableData.forEach((cell, i) => {
    doc.rect(marginLeft + (i * colWidth), currentY, colWidth, cellHeight, 'FD');
    doc.text(cell, marginLeft + (i * colWidth) + cellPadding, currentY + 7);
  });
  
  currentY += cellHeight + 20;

  // Texto do responsável
  doc.text(`Equipamento entregue por ${data.responsavel || ''}.`, marginLeft, currentY);
  currentY += 40;

  // Nome do recebedor
  doc.text(`${data.nome || ''} ${data.sobrenome || ''}`.trim(), marginLeft, currentY);
  currentY += 10;

  // Linha para assinatura
  doc.text('Assinatura: _____________________', marginLeft, currentY);

  // Adicionar assinatura se existir
  if (data.assinatura) {
    try {
      const assinaturaData = data.assinatura.split(',')[1];
      doc.addImage(assinaturaData, 'PNG', marginLeft + 25, currentY - 15, 70, 25);
    } catch (error) {
      console.warn('Erro ao adicionar assinatura:', error);
    }
  }

  return doc;
};

module.exports = { generateTermoRecebimento }; 