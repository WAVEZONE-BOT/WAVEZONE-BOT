  await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'HTML' });
  await ctx.reply(`✅ Signal #${tradeId} posted to channel.`);
});

bot.command('update', async (ctx) => {
  if (!isAuthorized(ctx)) return ctx.reply('⛔ Not authorized.');
  const text = ctx.message.text;
  let parsed;
  try {
    parsed = parseUpdateCommand(text);
  } catch (err) {
    return ctx.reply('⚠️ Format: /update ID sl=PRICE tp=PRICE note="text"');
  }
  const trade = store.getTrade(parsed.tradeId);
  if (!trade) return ctx.reply(`⚠️ No open trade found with ID #${parsed.tradeId}.`);
  store.updateTrade(parsed.tradeId, parsed);
  const trader = traderName(ctx);
  const message = formatUpdateAlert({ ...trade, ...parsed, trader });
  await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'HTML' });
  await ctx.reply(`✅ Update posted for signal #${parsed.tradeId}.`);
});

bot.command('close', async (ctx) => {
  if (!isAuthorized(ctx)) return ctx.reply('⛔ Not authorized.');
  const text = ctx.message.text;
  let parsed;
  try {
    parsed = parseCloseCommand(text);
  } catch (err) {
    return ctx.reply('⚠️ Format: /close ID result=tp|sl|manual pips=+38');
  }
  const trade = store.getTrade(parsed.tradeId);
  if (!trade) return ctx.reply(`⚠️ No open trade found with ID #${parsed.tradeId}.`);
  store.closeTrade(parsed.tradeId, parsed);
  const trader = traderName(ctx);
  const message = formatCloseAlert({ ...trade, ...parsed, trader });
  await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'HTML' });
  await ctx.reply(`✅ Close posted for signal #${parsed.tradeId}.`);
});

bot.command('risk', async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split(' ').slice(1);
  const args = {};
  parts.forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) args[k.toLowerCase()] = v;
  });
  const balance = parseFloat(args.balance);
  const riskPct = parseFloat(args.risk);
  const slPips = parseFloat(args.sl);
  if (!balance || !riskPct || !slPips) {
    return ctx.reply('Format: /risk balance=1000 risk=1 sl=30');
  }
  const lot = calcLotSize(balance, riskPct, slPips);
  const cashRisk = (balance * riskPct / 100).toFixed(2);
  await ctx.reply(
    `📐 <b>Lot Size Calculator</b>\n\nBalance: $${balance.toLocaleString()}\nRisk: ${riskPct}% ($${cashRisk})\nStop Loss: ${slPips} pips\n\n➡️ Suggested lot size: <b>${lot}</b>`,
    { parse_mode: 'HTML' }
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    `🌊 <b>WAVEZONE Signal Bot</b>\n\n<b>Traders (Andy / Nam):</b>\n/trade PAIR buy|sell entry=PRICE sl=PRICE tp=PRICE risk=1\n/update ID sl=PRICE note="text"\n/close ID result=tp|sl|manual pips=+38\n\n<b>Members:</b>\n/risk balance=1000 risk=1 sl=30\n/disclaimer\n/help\n\n⚠️ Signals are trades we take ourselves, not advice.`,
    { parse_mode: 'HTML' }
  );
});

bot.launch();
console.log('🌊 WAVEZONE bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
