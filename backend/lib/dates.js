// Compte les jours ouvrables (lundi–vendredi) entre deux dates ISO incluses, hors jours fériés.
// Calcul en UTC pour être indépendant du fuseau horaire du serveur.
function countWorkingDays(debut, fin, feries = new Set()) {
  const start = new Date(`${debut}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  let n = 0;
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6 && !feries.has(d.toISOString().slice(0, 10))) n++;
  }
  return n;
}
module.exports = { countWorkingDays };
