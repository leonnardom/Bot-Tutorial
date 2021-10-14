const porcent = 360 / 100,
  porcentTotal = porcent * ((doc.xp / doc.level) * 250 * 100);

ctx.lineCap = "round";

/* Fundo */

ctx.beginPath();
ctx.arc(90, 90, 70, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
ctx.strokeStyle = "#b1b1b1";
ctx.lineWidth = "10";
ctx.stroke();

/* Barra de progresso */

ctx.beginPath();
ctx.strokeStyle = "#3949AB";
ctx.lineWidth = "10";

ctx.arc(
  90,
  90,
  70,
  (Math.PI / 180) * 270,
  (Math.PI / 180) * (270 + porcentTotal)
);
ctx.stroke();
