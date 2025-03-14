import { jsPDF } from 'jspdf';

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
  const marginLeft = 25;
  const marginRight = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 30;

  // Título centralizado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RECEBIMENTO', pageWidth / 2, currentY, { align: 'center' });
  currentY += 25;

  // Linha decorativa
  doc.setDrawColor(47, 128, 237); // Cor #2F80ED
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY - 10, pageWidth - marginLeft, currentY - 10);

  // Conteúdo principal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Texto introdutório
  const introText = 'Pelo presente termo, declaro ter recebido o(s) equipamento(s) abaixo discriminado(s), comprometendo-me a mantê-lo(s) sob minha guarda e responsabilidade, dele(s) fazendo uso adequado, de acordo com as recomendações técnicas aplicáveis.';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginLeft, currentY);
  currentY += splitIntro.length * 7 + 15;

  // Informações do recebedor
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO RECEBEDOR', marginLeft, currentY);
  currentY += 10;
  doc.setFont('helvetica', 'normal');

  // Nome completo
  if (data.nome || data.sobrenome) {
    const nomeCompleto = `${data.nome || ''} ${data.sobrenome || ''}`.trim();
    doc.text('Nome completo:', marginLeft, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeCompleto, marginLeft + 35, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
  }

  // Email
  if (data.email) {
    doc.text('E-mail:', marginLeft, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(data.email, marginLeft + 35, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 10;
  }

  // Equipamento
  if (data.equipamento) {
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('EQUIPAMENTO RECEBIDO', marginLeft, currentY);
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    
    // Adiciona box em volta do equipamento
    const equipHeight = 15;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(marginLeft, currentY - 5, contentWidth, equipHeight, 3, 3, 'FD');
    
    doc.text(data.equipamento, marginLeft + 5, currentY + 5);
    currentY += equipHeight + 10;
  }

  // Data
  currentY += 15;
  const dataAtual = data.data || new Date().toLocaleDateString('pt-BR');
  doc.text(dataAtual, pageWidth - marginRight - 30, currentY);

  // Área de assinatura
  currentY += 5;
  if (data.assinatura) {
    try {
      // Converter base64 para imagem
      const assinaturaData = data.assinatura.split(',')[1];
      doc.addImage(assinaturaData, 'PNG', marginLeft, currentY, 70, 25);
    } catch (error) {
      console.warn('Erro ao adicionar assinatura:', error);
    }
  }

  // Linha para assinatura
  doc.setDrawColor(0);
  doc.line(marginLeft, currentY + 30, pageWidth / 2 - 10, currentY + 30);
  doc.setFontSize(10);
  doc.text('Assinatura', marginLeft, currentY + 35);

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('© Desenvolvido por Villela Tech', pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc;
}; 