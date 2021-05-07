import { Telegraf } from "telegraf";
import {
  getAllDistrictInState,
  getAllStates,
  getSessionsByDistrict,
} from "./cowin.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

let state = 21;
let district = 363;

const getArgument = (command, text) => {
  return text.substr(command.length + 2);
};

bot.help((ctx) => {
  ctx.reply("use /find. /state and /district to change them.")
});

bot.command("state", async (ctx) => {
  const arg = getArgument("state", ctx.message.text);

  const allStates = await getAllStates();
  const found = allStates.find(
    (el) => el.state_name.toUpperCase() === arg.toUpperCase()
  );

  if (found) {
    state = found.state_id;
    ctx.reply(`State set: \`${found.state_name}\``);
  } else ctx.reply("State not found.");
});

bot.command("district", async (ctx) => {
  const arg = getArgument("district", ctx.message.text);

  if (state == undefined) {
    ctx.reply("State not set.");
    return;
  }

  const allDistricts = await getAllDistrictInState(state);
  const found = allDistricts.find(
    (el) => el.district_name.toUpperCase() === arg.toUpperCase()
  );

  if (found) {
    district = found.district_id;
    ctx.reply(`District set: \`${found.district_name}\``);
  } else ctx.reply("District not found.");
});

bot.command("find", async (ctx) => {
  if (state === undefined || district === undefined) {
    ctx.reply("State and district not set.");
    ctx.replyWithMarkdown();
  }

  findSlots(ctx.message.chat.id);
  setInterval(() => {
    findSlots(ctx.message.chat.id);
  }, 150000);
});

const findSlots = (chatId) => {
  console.log("Finding...");

  const date = new Date();

  getSessionsByDistrict(
    district,
    `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  ).then((res) => {
    console.log(`Found ${res.length} sessions`);
    for (const session of res) {
      bot.telegram.sendMessage(
        chatId,
`*Found session(s):*
*Date:* ${session.date}
*Center Name:* ${session.name}
*Center Address:* ${session.address}
*Fee Type:* ${session.fee}
*Vaccine:* ${session.vaccine}
*Seats Left:* ${session.capacity} 
*Age:* ${session.age}+
*Slots:* ${session.slots}`,
        { parse_mode: "Markdown" }
      );
    }
  });
};

bot.launch();
