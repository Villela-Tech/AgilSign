import jsPDF from 'jspdf';

interface TermoRecebimentoData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  equipamento?: string;
  assinatura?: string;
  data?: string;
  numeroSerie?: string;
  patrimonio?: string;
  status?: string;
  id?: string | number;
}

export const generateTermoRecebimento = async (data: TermoRecebimentoData) => {
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 30;
  const marginRight = 30;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 40;

  // Título centralizado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 50;

  // Nome
  if (data.nome || data.sobrenome) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('NOME:', marginLeft, currentY);
    const nomeCompleto = `${data.nome || ''} ${data.sobrenome || ''}`.trim();
    const lineWidth = 145;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(marginLeft + 15, currentY, marginLeft + lineWidth, currentY);
    doc.text(nomeCompleto, marginLeft + 15, currentY - 1);
    currentY += 35;
  }

  // Texto principal
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const introText = 'Declaro estar ciente de que todos os itens especificados e entregues nesta ficha foram entregues gratuitamente para o exercício da minha função, sendo os mesmos de exclusiva propriedade da empresa, bem como a obrigatoriedade de seu uso no exercício de minhas atividades, comprometendo-me assim a respeitar e cumprir o que segue abaixo:';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginLeft, currentY);
  currentY += splitIntro.length * 7 + 20;

  // Equipamento
  if (data.equipamento) {
    doc.text('Equipamento:', marginLeft, currentY);
    doc.text(data.equipamento, marginLeft + 25, currentY);
    currentY += 50;
  }

  // Data
  const dataAtual = data.data || new Date().toLocaleDateString('pt-BR');
  doc.text(dataAtual, pageWidth - marginRight - 25, currentY);
  currentY += 30;

  // Área de assinatura
  if (data.assinatura) {
    try {
      const img = new Image();
      img.src = data.assinatura;
      doc.addImage(img, 'PNG', marginLeft + 25, currentY - 20, 70, 25);
    } catch (error) {
      console.warn('Erro ao adicionar assinatura:', error);
    }
  }

  // Linha para assinatura
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  const lineLength = 145;
  doc.line(marginLeft + 25, currentY + 15, marginLeft + lineLength, currentY + 15);

  return doc;
};

export const generateTermoCompleto = async (data: TermoRecebimentoData) => {
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 30;
  const marginRight = 30;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 30;

  // Título centralizado
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RECEBIMENTO E RESPONSABILIDADE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  // Informações do termo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Identificação
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COLABORADOR:', marginLeft, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 8;
  
  // Nome completo
  const nomeCompleto = `${data.nome || ''} ${data.sobrenome || ''}`.trim();
  doc.text(`Nome: ${nomeCompleto}`, marginLeft, currentY);
  currentY += 8;
  
  // Pulando a exibição do email e ajustando a altura
  currentY += 5;
  
  // Equipamento
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO EQUIPAMENTO:', marginLeft, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 8;
  
  if (data.equipamento) {
    doc.text(`Equipamento: ${data.equipamento}`, marginLeft, currentY);
    currentY += 8;
  }
  
  if (data.numeroSerie) {
    doc.text(`Número de Série: ${data.numeroSerie}`, marginLeft, currentY);
    currentY += 8;
  }
  
  if (data.patrimonio) {
    doc.text(`Patrimônio: ${data.patrimonio}`, marginLeft, currentY);
    currentY += 8;
  }
  
  currentY += 5;
  
  // Texto principal
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', marginLeft, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 10;
  
  const introText = 'Declaro estar ciente de que todos os itens especificados e entregues nesta ficha foram entregues gratuitamente para o exercício da minha função, sendo os mesmos de exclusiva propriedade da empresa, bem como a obrigatoriedade de seu uso no exercício de minhas atividades, comprometendo-me assim a respeitar e cumprir o termo de responsabilidade.';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginLeft, currentY);
  currentY += splitIntro.length * 7 + 10;

  // Data
  const dataAtual = data.data || new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${dataAtual}`, marginLeft, currentY);
  currentY += 30;

  // Área de assinatura
  doc.text('Assinatura do colaborador:', marginLeft, currentY);
  currentY += 5;
  
  // Adicionar a imagem da assinatura se existir
  if (data.assinatura) {
    try {
      const img = new Image();
      img.src = data.assinatura;
      doc.addImage(img, 'PNG', marginLeft, currentY, 70, 25);
    } catch (error) {
      console.warn('Erro ao adicionar assinatura:', error);
    }
  }

  // Sempre adicionar a linha para assinatura, independente de ter ou não assinatura
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  const lineLength = 80;
  doc.line(marginLeft + 0, currentY + 20, marginLeft + lineLength, currentY + 20);

  // Identificação do documento
  doc.setFontSize(8);
  doc.text(`ID do Termo: ${data.id || 'N/A'}`, pageWidth - marginRight - 40, pageHeight - 10);

  return doc;
}; 