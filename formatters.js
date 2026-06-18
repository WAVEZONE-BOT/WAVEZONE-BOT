const SHORT_DISCLAIMER = '⚠️ This is a trade we are personally taking, not advice. Trade at your own risk.';

function dirArrow(direction) {
  return direction === 'BUY' ? '🟢' : '🔴';
}

function dirLabel(direction) {
  return direction === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT';
}

function rrRatio(entry, sl, tp) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const t = parseFloat(tp);
  if (!e || !s || !t) return null;
  const risk = Math.abs(e - s);
  const reward = Math.abs(t - e);
  if (risk === 0) return null;
  return (reward / risk).toFixed(1);
}

function formatTradeAlert({ pair, direction, entry, sl, tp, risk, notes, trader, tradeId }) {
  const rr = rrRatio(entry, sl, tp);
  let msg = `${dirArrow(direction)} <b>NEW SIGNAL — ${pair}</b>\n`;
  msg += `<i>Trade by ${trader}</i>\n\n`;
  msg += `Direction: <b>${dirLabel(direction)}</b>\n`;
  msg += `Entry: <b>${entry}</b>\n`;
  if (sl) msg += `Stop Loss: <b>${sl}</b>\n`;
  if (tp) msg += `Take Profit: <b>${tp}</b>\n`;
  if (rr) msg += `Risk:Reward: <b>1:${rr}</b>\n`;
  msg += `Suggested Risk: <b>${risk}%</b> of account\n`;
  if (notes) msg += `\n📝 ${notes}\n`;
  msg += `\n#️⃣ Signal ID: <code>${tradeId}</code>`;
  msg += `\n\n<i>Use /risk balance=YOUR_BALANCE risk=${risk} sl=PIPS to size your lot.</i>`;
  msg += `\n\n${SHORT_DISCLAIMER}`;
  return msg;
}

function formatUpdateAlert({ pair, trader, tradeId, sl, tp, note }) {
  let msg = `🔔 <b>TRADE UPDATE — ${pair}</b>\n`;
  msg += `<i>Update by ${trader} · Signal #${tradeId}</i>\n\n`;
  if (sl) msg += `New Stop Loss: <b>${sl}</b>\n`;
  if (tp) msg += `New Take Profit: <b>${tp}</b>\n`;
  if (note) msg += `\n📝 ${note}`;
  return msg;
}

function formatCloseAlert({ pair, trader, tradeId, result, pips, note }) {
  const resultLabel = {
    tp: '🎯 Hit Take Profit',
    sl: '🛑 Hit Stop Loss',
    manual: '✋ Closed Manually',
  }[result] || 'Closed';
  let msg = `✅ <b>TRADE CLOSED — ${pair}</b>\n`;
  msg += `<i>Closed by ${trader} · Signal #${tradeId}</i>\n\n`;
  msg += `Result: <b>${resultLabel}</b>\n`;
  if (pips) msg += `P&L: <b>${pips} pips</b>\n`;
  if (note) msg += `\n📝 ${note}`;
  return msg;
}

module.exports = { formatTradeAlert, formatUpdateAlert, formatCloseAlert, SHORT_DISCLAIMER };
