let trades = {};
let nextId = 1;

function createTrade(data) {
  const id = nextId++;
  trades[id] = {
    id,
    ...data,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  return id;
}

function getTrade(id) {
  return trades[id];
}

function updateTrade(id, patch) {
  if (!trades[id]) return null;
  trades[id] = { ...trades[id], ...patch, updatedAt: new Date().toISOString() };
  return trades[id];
}

function closeTrade(id, patch) {
  if (!trades[id]) return null;
  trades[id] = { ...trades[id], ...patch, status: 'closed', closedAt: new Date().toISOString() };
  return trades[id];
}

function allOpenTrades() {
  return Object.values(trades).filter(t => t.status === 'open');
}

module.exports = { createTrade, getTrade, updateTrade, closeTrade, allOpenTrades };
