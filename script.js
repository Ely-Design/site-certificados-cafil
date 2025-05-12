const form = document.getElementById("certForm");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const categoriaSelect = document.getElementById("categoria");
const extraCampos = document.getElementById("extraCampos");

const categorias = {
  "Ouvinte": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como ouvinte da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Monitor SRF": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como Monitor SRF da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Monitor Inscriçao": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como Monitor da INSCRIÇÃO DE DISCIPLINAS DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Mediador": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como mediador(a) da mesa {mesa} da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Palestrante": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como palestrante na mesa {mesa} da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Organizador": "Declaramos, para fins de instruir curriculum vitae, que {nome} participou como organizador(a) da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano} no Instituto de Filosofia e Ciências Sociais - IFCS/UFRJ, durante {dias} dias, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares."
};

const horasPorCategoria = {
  "Ouvinte": "8",
  "Monitor SRF": "10",
  "Monitor Inscriçao": "8",
  "Mediador": "10",
  "Palestrante": "10",
  "Organizador": "30"
};

categoriaSelect.addEventListener("change", () => {
  const valor = categoriaSelect.value;
  extraCampos.style.display = ["Organizador"].includes(valor) ? "block" : "none";
  extraCampos1.style.display = ["Mediador", "Palestrante"].includes(valor) ? "block" : "none";
  const campoHoras = document.getElementById("horas");
  campoHoras.value = horasPorCategoria[valor] || "";
});

function formatarMesAno(dataStr) {
  const [dia, mes, ano] = dataStr.split("/");
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${meses[parseInt(mes) - 1]} de ${ano}`;
}

function wrapTextJustified(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  const normalSpace = ctx.measureText(' ').width;

  for (let i = 0; i < lines.length; i++) {
    const wordsInLine = lines[i].split(' ');
    const totalWords = wordsInLine.length;

    if (i === lines.length - 1 || totalWords === 1) {
      ctx.fillText(lines[i], x, y);
    } else {
      // Calcular largura real da linha sem espaços
      let wordsWidth = 0;
      for (const word of wordsInLine) {
        wordsWidth += ctx.measureText(word).width;
      }

      // Espaço restante distribuído entre os espaços
      const spaceCount = totalWords - 1;
      const remainingSpace = maxWidth - wordsWidth;
      let spaceWidth = remainingSpace / spaceCount;

      // Garante no mínimo a largura de um espaço real
      if (spaceWidth < normalSpace) {
        spaceWidth = normalSpace;
      }

      let currentX = x;
      for (let j = 0; j < totalWords; j++) {
        ctx.fillText(wordsInLine[j], currentX, y);
        const wordWidth = ctx.measureText(wordsInLine[j]).width;
        currentX += wordWidth + spaceWidth;
      }
    }
    y += lineHeight;
  }
}

const nomesInput = document.getElementById("nomes");

nomesInput.addEventListener("input", () => {
  // Remove os caracteres "-" e "_"
  nomesInput.value = nomesInput.value.replace(/[-_]/g, '');
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomes = document.getElementById("nomes").value.split("\n").map(n => n.trim()).filter(Boolean);
  const categoria = categoriaSelect.value;
  const mesa = document.getElementById("mesa").value;
  const dias = document.getElementById("dias").value;
  const dataISO = document.getElementById("data").value; // yyyy-mm-dd
  const [ano, mes, dia] = dataISO.split("-");
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const periodo = document.getElementById("periodo").value;
  const horas = document.getElementById("horas").value;
  const mesAno = formatarMesAno(dataFormatada);
  const dataExtenso = `${dia} de ${mesAno}`;


  const zip = new JSZip();
  const template = new Image();

  template.src = "template.png";
  await new Promise(resolve => template.onload = resolve);

  // Garante carregamento da fonte Lora antes de desenhar
  await document.fonts.load('72px Lora');

  canvas.width = template.width;
  canvas.height = template.height;

  for (const nome of nomes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template, 0, 0);

    const textoBase = categorias[categoria]
      .replace("{nome}", nome)
      .replace("{mesa}", mesa)
      .replace("{dias}", dias)
      .replace("{periodo}", ano+"."+periodo)
      .replace("{mes_ano}", mesAno)
      .replace("{horas}", horas);

    // Texto justificável
    ctx.font = "46px Lora";
    ctx.textAlign = "left";
    wrapTextJustified(ctx, textoBase, 235, 870, canvas.width - 475, 85);

    // Data por extenso (inferior direita)
    ctx.font = "35px Lora";
    ctx.fillText(dataExtenso, 1210, 1366);

    // Ano (inferior esquerda)
    ctx.font = "35px Lora";
    ctx.fillText(ano, 570, 1493);

    // Ano e período (topo direita)
    ctx.font = "bold 83px Lora";
    ctx.fillText(`${ano}.${periodo}`, 1900, 587);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    zip.file(`certificado_${nome}.png`, blob);
  }

  zip.generateAsync({ type: "blob" })
    .then(content => saveAs(content, categoria+"_"+dia+"-"+mes+"_"+"certificados.zip"));
});

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}
