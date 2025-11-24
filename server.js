const express = require('express');
const cors = require('cors');
const { jsPDF } = require('jspdf');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está rodando!' });
});

// Rota principal para gerar PDF
app.post('/gerar-pdf', (req, res) => {
  try {
    const { markdown, titulo } = req.body;

    if (!markdown) {
      return res.status(400).json({ erro: 'Campo "markdown" é obrigatório' });
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const larguraTexto = pageWidth - margin * 2;
    let posY = margin;

    // Parsear markdown
    const tokens = marked.lexer(markdown);

    tokens.forEach(token => {
      if (posY > pageHeight - margin) {
        doc.addPage();
        posY = margin;
      }

      switch (token.type) {
        case 'heading':
          doc.setTextColor(0, 0, 0);
          const sizes = { 1: 20, 2: 16, 3: 13, 4: 11, 5: 10, 6: 9 };
          const colors = { 1: [0, 0, 0], 2: [30, 70, 180], 3: [60, 100, 200] };
          
          doc.setFontSize(sizes[token.depth] || 11);
          if (colors[token.depth]) doc.setTextColor(...colors[token.depth]);
          
          const textoDividido = doc.splitTextToSize(token.text, larguraTexto);
          doc.text(textoDividido, margin, posY);
          posY += textoDividido.length * 7 + 3;
          break;

        case 'paragraph':
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const paragrafo = limparMarkdown(token.text);
          const paragrafoDiv = doc.splitTextToSize(paragrafo, larguraTexto);
          doc.text(paragrafoDiv, margin, posY);
          posY += paragrafoDiv.length * 6 + 5;
          break;

        case 'list':
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          token.items.forEach(item => {
            const simbolo = token.ordered ? '•' : '-';
            const itemTexto = limparMarkdown(item.text);
            const itemDiv = doc.splitTextToSize(itemTexto, larguraTexto - 8);
            doc.text(simbolo + ' ', margin + 2, posY);
            itemDiv.forEach((linha, idx) => {
              doc.text(linha, margin + 8, posY + (idx * 5));
            });
            posY += itemDiv.length * 5 + 2;
          });
          posY += 3;
          break;

        case 'blockquote':
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setDrawColor(0, 0, 180);
          doc.setLineWidth(1);
          const citacao = limparMarkdown(token.text);
          const citacaoDiv = doc.splitTextToSize(citacao, larguraTexto - 8);
          doc.line(margin + 2, posY - 2, margin + 2, posY + citacaoDiv.length * 5 + 2);
          doc.text(citacaoDiv, margin + 8, posY);
          posY += citacaoDiv.length * 5 + 5;
          break;

        case 'code':
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          doc.setFillColor(240, 240, 240);
          const codigoDiv = doc.splitTextToSize(token.text, larguraTexto - 4);
          doc.rect(margin + 1, posY - 3, larguraTexto - 2, codigoDiv.length * 4 + 4, 'F');
          doc.text(codigoDiv, margin + 3, posY);
          posY += codigoDiv.length * 4 + 6;
          break;
      }
    });

    // Rodapé com numeração de páginas
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`${i} / ${totalPages}`, pageWidth - 20, pageHeight - 8);
    }

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Enviar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${titulo || 'documento'}.pdf"`);
    res.send(pdfBuffer);

  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    res.status(500).json({ erro: 'Erro ao gerar PDF', detalhes: erro.message });
  }
});

// Rota para receber markdown e retornar JSON com o PDF em base64
app.post('/gerar-pdf-base64', (req, res) => {
  try {
    const { markdown, titulo } = req.body;

    if (!markdown) {
      return res.status(400).json({ erro: 'Campo "markdown" é obrigatório' });
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const larguraTexto = pageWidth - margin * 2;
    let posY = margin;

    const tokens = marked.lexer(markdown);

    tokens.forEach(token => {
      if (posY > pageHeight - margin) {
        doc.addPage();
        posY = margin;
      }

      switch (token.type) {
        case 'heading':
          doc.setTextColor(0, 0, 0);
          const sizes = { 1: 20, 2: 16, 3: 13, 4: 11, 5: 10, 6: 9 };
          const colors = { 1: [0, 0, 0], 2: [30, 70, 180], 3: [60, 100, 200] };
          
          doc.setFontSize(sizes[token.depth] || 11);
          if (colors[token.depth]) doc.setTextColor(...colors[token.depth]);
          
          const textoDividido = doc.splitTextToSize(token.text, larguraTexto);
          doc.text(textoDividido, margin, posY);
          posY += textoDividido.length * 7 + 3;
          break;

        case 'paragraph':
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const paragrafo = limparMarkdown(token.text);
          const paragrafoDiv = doc.splitTextToSize(paragrafo, larguraTexto);
          doc.text(paragrafoDiv, margin, posY);
          posY += paragrafoDiv.length * 6 + 5;
          break;

        case 'list':
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          token.items.forEach(item => {
            const simbolo = token.ordered ? '•' : '-';
            const itemTexto = limparMarkdown(item.text);
            const itemDiv = doc.splitTextToSize(itemTexto, larguraTexto - 8);
            doc.text(simbolo + ' ', margin + 2, posY);
            itemDiv.forEach((linha, idx) => {
              doc.text(linha, margin + 8, posY + (idx * 5));
            });
            posY += itemDiv.length * 5 + 2;
          });
          posY += 3;
          break;

        case 'blockquote':
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setDrawColor(0, 0, 180);
          doc.setLineWidth(1);
          const citacao = limparMarkdown(token.text);
          const citacaoDiv = doc.splitTextToSize(citacao, larguraTexto - 8);
          doc.line(margin + 2, posY - 2, margin + 2, posY + citacaoDiv.length * 5 + 2);
          doc.text(citacaoDiv, margin + 8, posY);
          posY += citacaoDiv.length * 5 + 5;
          break;

        case 'code':
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          doc.setFillColor(240, 240, 240);
          const codigoDiv = doc.splitTextToSize(token.text, larguraTexto - 4);
          doc.rect(margin + 1, posY - 3, larguraTexto - 2, codigoDiv.length * 4 + 4, 'F');
          doc.text(codigoDiv, margin + 3, posY);
          posY += codigoDiv.length * 4 + 6;
          break;
      }
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`${i} / ${totalPages}`, pageWidth - 20, pageHeight - 8);
    }

    const pdfBase64 = doc.output('dataurlstring').split(',')[1];

    res.json({
      sucesso: true,
      titulo: titulo || 'documento',
      pdf_base64: pdfBase64
    });

  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    res.status(500).json({ erro: 'Erro ao gerar PDF', detalhes: erro.message });
  }
});

function limparMarkdown(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#+\s*/g, '')
    .trim();
}

app.listen(PORT, () => {
  console.log(`📄 API rodando em http://localhost:${PORT}`);
  console.log(`POST http://localhost:${PORT}/gerar-pdf`);
  console.log(`POST http://localhost:${PORT}/gerar-pdf-base64`);
});