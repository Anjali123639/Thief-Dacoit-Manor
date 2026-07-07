---
name: Game round resolution pattern
description: How to handle round end writes in multiplayer games where action-takers and host may differ.
---

## Rule
In real-time multiplayer games, do NOT gate round-end Firestore writes exclusively on `user.uid === host.uid`. Players performing actions (e.g. Police accusing) must be able to finalize round state.

**Why:** When the host is not the acting player (e.g. host has Babu role, Police is another player), a host-only guard silently drops the accusation result and the round never ends — falling back to timer expiry with wrong scoring.

## Pattern
```ts
const processRoundEnd = async (...) => {
  // Prevent double-writes if result already recorded
  if (roomData.gameState?.roundResult) return;
  // proceed with write — any authorized player can finalize
};
```

**How to apply:** Any multiplayer turn-based game where the player taking the action may not be the room host.
