import jsPDF from 'jspdf';

interface TermoRecebimentoData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  equipamento?: string;
  assinatura?: string;
  data?: string;
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

  // Itens numerados
  doc.text('1º - Fazer uso deste(s), abstendo-me de usá-los para fins extra-profissionais;', marginLeft, currentY);
  currentY += 15;
  doc.text('2º - Zelar pela boa conservação destes;', marginLeft, currentY);
  currentY += 15;
  doc.text('3º - A restituí-los, ou seu valor correspondente, à empresa nos seguintes casos:', marginLeft, currentY);
  currentY += 20;

  // Subitens com bullets
  doc.text('• Na eventualidade de me afastar do emprego definitivamente;', marginLeft + 10, currentY);
  currentY += 15;
  doc.text('• No caso de extravio ou quaisquer danos oriundos de mau uso ou falta de cuidado', marginLeft + 10, currentY);
  doc.text('  para com eles;', marginLeft + 10, currentY + 7);
  currentY += 22;
  doc.text('• Por ocasião de troca por outros, depois de ter feito o devido uso;', marginLeft + 10, currentY);
  currentY += 40;

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