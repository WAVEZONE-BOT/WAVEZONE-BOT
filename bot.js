require('dotenv').config();
const { Telegraf } = require('telegraf');
const { formatTradeAlert, formatUpdateAlert, formatCloseAlert, SHORT_DISCLAIMER } = require('./formatters');
const { parseTradeCommand, parseUpdateCommand, parseCloseCommand } = require('./parser');
const { calcLotSize } = require('./riskCalc');
const store = require('./store');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const AUTHORIZED_IDS = (process.env.AUTHORIZED_USER_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

if (!BOT_TOKEN) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const FULL_DISCLAIMER = `WAVEZONE shares the trades and ideas of Andy and Nam for educational and informational purposes only. This is <b>not financial advice</b> — we are not your financial advisor, broker, or fund manager.

Every signal posted here is a trade we are personally taking. We are sharing our own positions, not instructing you to copy them. Any decision to enter, manage, or exit a trade is entirely your own, made at your own risk.

Trading forex, gold, indices, crypto, and other leveraged products carries a high level of risk and you can lose more than your deposit. Past performance is not a reliable indicator of future results.

WAVEZONE, Andy, and Nam accept no liability for any loss arising from use of this content.`;

function isAuthorized(ctx) {
  if (AUTHORIZED_IDS.length === 0) return true;
  return AUTHORIZED_IDS.includes(String(ctx.from.id));
}

function traderName(ctx) {
  const map = (process.env.TRADER_NAMES || '')
    .split(',').map(p => p.trim().split(':'))
    .filter(p => p.length === 2)
    .reduce((acc, [id, name]) => ({ ...acc, [id]: name }), {});
  return map[String(ctx.from.id)] || ctx.from.first_name || 'Trader';
}

bot.command('start', async (ctx) => {
  await ctx.reply(
    `🌊 <b>Welcome to WAVEZONE</b>\n\nAndy and Nam post the trades they're personally taking straight to this channel.\n\n<b>⚠️ Before you continue:</b>\n${FULL_DISCLAIMER}\n\nType /help to see all commands.`,
    { parse_mode: 'HTML' }
  );
});

bot.command('disclaimer', async (ctx) => {
  await ctx.reply(`⚠️ <b>WAVEZONE Risk Disclosure</b>\n\n${FULL_DISCLAIMER}`, { parse_mode: 'HTML' });
});

bot.command('trade', async (ctx) => {
  if (!isAuthorized(ctx)) return ctx.reply('⛔ Not authorized.');
  const text = ctx.message.text;
  let parsed;
  try {
    parsed = parseTradeCommand(text);
  } catch (err) {
    return ctx.reply('⚠️ Format: /trade PAIR buy|sell entry=PRICE sl=PRICE tp=PRICE risk=1');
  }
  const trader = traderName(ctx);
  const tradeId = store.createTrade({ ...parsed, trader });
  const message = formatTradeAlert({ ...parsed, trader, tradeId });
  await bot
