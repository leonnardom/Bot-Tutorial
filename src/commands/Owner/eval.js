exports.run = async (client, message, args) => {
  if (message.author.id !== "600804786492932101") return;
  if (!args[0]) return;

  let litchdelicia = args.join(" ");
  let litchtotoso = eval(litchdelicia);
  if (typeof litchtotoso !== "string")
    litchtotoso = require("util").inspect(litchtotoso, { depth: 0 });
  message.channel.send(
    `Entrada: \`\`\`js\n${litchdelicia}\`\`\`\n Saída: \`\`\`js\n${litchtotoso}\`\`\``
  );
};

exports.help = {
  name: "eval",
  aliases: [],
};
