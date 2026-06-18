function extractKeyValues(text) {
  const args = {};
  const regex = /(\w+)=("([^"]*)"|\S+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[3] !== undefined ? match[3] : match[2];
    args[key] = value;
  }
  return args;
}

function parseTradeCommand(text) {
  const body = text.replace(/^\/trade(@\w+)?\s*/i, '').trim();
  const tokens = body.split(/\s+/);

  if (tokens.length < 2) {
    throw new Error('Missing pair or direction');
  }

  const pair = tokens[0].toUpperCase();
  const direction = tokens[1].toUpperCase();

  if (!['BUY', 'SELL', 'LONG', 'SHORT'].includes(direction)) {
    throw new Error('Direction must be buy or sell');
  }

  const args = extractKeyValues(body);

  return {
    pair,
    direction: (direction === 'LONG' ? 'BUY' : direction === 'SHORT' ? 'SELL' : direction),
    entry: args.entry || 'Market',
    sl: args.sl || null,
    tp: args.tp || null,
    risk: args.risk ? parseFloat(args.risk) : 1,
    notes: args.note || args.notes || null,
  };
}

function parseUpdateCommand(text) {
  const body = text.replace(/^\/update(@\w+)?\s*/i, '').trim();
  const tokens = body.split(/\s+/);
  const tradeId = parseInt(tokens[0], 10);

  if (!tradeId) throw new Error('Missing trade ID');

  const args = extractKeyValues(body);

  return {
    tradeId,
    sl: args.sl || null,
    tp: args.tp || null,
    note: args.note || args.notes || null,
  };
}

function parseCloseCommand(text) {
  const body = text.replace(/^\/close(@\w+)?\s*/i, '').trim();
  const tokens = body.split(/\s+/);
  const tradeId = parseInt(tokens[0], 10);

  if (!tradeId) throw new Error('Missing trade ID');

  const args = extractKeyValues(body);

  return {
    tradeId,
    result: (args.result || 'manual').toLowerCase(),
    pips: args.pips || null,
    note: args.note || args.notes || null,
  };
}

module.exports = { parseTradeCommand, parseUpdateCommand, parseCloseCommand, extractKeyValues };
