export function distributeRoles(playerUids: string[], playerCount: number): Record<string, "babu" | "police" | "chor" | "dakat"> {
  let roleCounts: { babu: number; police: number; chor: number; dakat: number };

  if (playerCount <= 4) {
    roleCounts = { babu: 1, police: 1, chor: 1, dakat: 1 };
  } else if (playerCount === 5) {
    roleCounts = { babu: 1, police: 1, chor: 2, dakat: 1 };
  } else if (playerCount === 6) {
    roleCounts = { babu: 1, police: 1, chor: 2, dakat: 2 };
  } else if (playerCount === 7) {
    roleCounts = { babu: 1, police: 2, chor: 2, dakat: 2 };
  } else if (playerCount === 8) {
    roleCounts = { babu: 1, police: 2, chor: 2, dakat: 3 };
  } else if (playerCount === 9) {
    roleCounts = { babu: 1, police: 2, chor: 3, dakat: 3 };
  } else if (playerCount === 10) {
    roleCounts = { babu: 1, police: 2, chor: 3, dakat: 4 };
  } else if (playerCount <= 12) {
    roleCounts = { babu: 1, police: 3, chor: 4, dakat: playerCount - 8 };
  } else {
    roleCounts = { babu: 2, police: 3, chor: 5, dakat: playerCount - 10 };
  }

  // Handle case where actual players are fewer than roleCounts sum
  const roles: Array<"babu" | "police" | "chor" | "dakat"> = [];
  for (let i = 0; i < roleCounts.babu; i++) roles.push("babu");
  for (let i = 0; i < roleCounts.police; i++) roles.push("police");
  for (let i = 0; i < roleCounts.chor; i++) roles.push("chor");
  for (let i = 0; i < roleCounts.dakat; i++) roles.push("dakat");

  // Trim or fill roles if playerCount mismatch
  while (roles.length > playerCount) roles.pop();
  while (roles.length < playerCount) roles.push("dakat");

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Shuffle players
  const shuffledPlayers = [...playerUids];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
  }

  const distribution: Record<string, "babu" | "police" | "chor" | "dakat"> = {};
  for (let i = 0; i < shuffledPlayers.length; i++) {
    distribution[shuffledPlayers[i]] = roles[i];
  }

  return distribution;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
