const form = document.getElementById("certForm");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const categoriaSelect = document.getElementById("categoria");
const extraCampos = document.getElementById("extraCampos");

const categorias = {
  "Ouvinte": "Declaramos que {nome} participou como ouvinte da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano}, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Monitor SRF": "Declaramos que {nome} participou como Monitor SRF da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano}, sendo-lhe conferidas {horas} horas de atividades acadêmicas extracurriculares.",
  "Mediador": "Declaramos que {nome} participou como mediador(a) da mesa {mesa} da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano}, sendo-lhe conferidas {horas} horas.",
  "Palestrante": "Declaramos que {nome} participou como palestrante na mesa {mesa} da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano}, sendo-lhe conferidas {horas} horas.",
  "Organizador": "Declaramos que {nome} participou como organizador(a) da SEMANA DE RECEPÇÃO DE CALOUROS {periodo} realizada em {mes_ano}, nos dias {dias}, sendo-lhe conferidas {horas} horas."
};

categoriaSelect.addEventListener("change", () => {
  const valor = categoriaSelect.value;
  extraCampos.style.display = ["Mediador", "Palestrante", "Organizador"].includes(valor) ? "block" : "none";
});

function formatarMesAno(dataStr) {
  const [dia, mes, ano] = dataStr.split("/");
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${meses[parseInt(mes) - 1]} de ${ano}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomes = document.getElementById("nomes").value.split("\n").map(n => n.trim()).filter(Boolean);
  const categoria = categoriaSelect.value;
  const mesa = document.getElementById("mesa").value;
  const dias = document.getElementById("dias").value;
  const data = document.getElementById("data").value;
  const periodo = document.getElementById("periodo").value;
  const horas = document.getElementById("horas").value;
  const mesAno = formatarMesAno(data);
  const ano = data.split("/")[2];
  const dataExtenso = `${data.split("/")[0]} de ${mesAno}`;

  const zip = new JSZip();
  const template = new Image();

  template.src = "template.png";
  await new Promise(resolve => template.onload = resolve);

  // Garante carregamento da fonte Lora antes de desenhar
  await document.fonts.load('24px Lora');

  canvas.width = template.width;
  canvas.height = template.height;

  for (const nome of nomes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template, 0, 0);

    const textoBase = categorias[categoria]
      .replace("{nome}", nome)
      .replace("{mesa}", mesa)
      .replace("{dias}", dias)
      .replace("{periodo}", periodo)
      .replace("{mes_ano}", mesAno)
      .replace("{horas}", horas);

    // Nome principal
    ctx.font = "bold 40px Lora";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(nome, canvas.width / 2, 450);

    // Texto justificável
    ctx.font = "24px Lora";
    ctx.textAlign = "left";
    wrapText(ctx, textoBase, 100, 500, canvas.width - 200, 30);

    // Data por extenso (inferior direita)
    ctx.font = "20px Lora";
    ctx.fillText(dataExtenso, 800, 1000);

    // Ano (inferior esquerda)
    ctx.font = "20px Lora";
    ctx.fillText(ano, 200, 1000);

    // Ano e período (topo direita)
    ctx.font = "bold 40px Lora";
    ctx.fillText(`${ano}.${periodo}`, 1800, 200);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    zip.file(`certificado_${nome}.png`, blob);
  }

  zip.generateAsync({ type: "blob" })
    .then(content => saveAs(content, "certificados.zip"));
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
