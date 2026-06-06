export interface RankingPlayerStats {
  name: string;
  gamesWon: number;
  setsWon: number;
  pointsWon: number;
  pointsLost: number;
  ratio: number;
  position: number;
}

export interface TieGroup {
  key: string;
  players: RankingPlayerStats[];
  positionStart: number;
  positionEnd: number;
}

export function getPlayerStatKey(
  stat: Pick<RankingPlayerStats, "gamesWon" | "setsWon" | "ratio">
) {
  return `${stat.gamesWon}:${stat.setsWon}:${stat.ratio}`;
}

export function findTieGroups(stats: RankingPlayerStats[]): TieGroup[] {
  const byKey = new Map<string, RankingPlayerStats[]>();

  for (const stat of stats) {
    const key = getPlayerStatKey(stat);
    const group = byKey.get(key) ?? [];
    group.push(stat);
    byKey.set(key, group);
  }

  return Array.from(byKey.entries())
    .filter(([, players]) => players.length >= 2)
    .map(([key, players]) => {
      const positions = players.map((player) => player.position).sort((a, b) => a - b);
      return {
        key,
        players,
        positionStart: positions[0],
        positionEnd: positions[positions.length - 1],
      };
    });
}

export function areTieResolutionsComplete(
  tieGroups: TieGroup[],
  resolutions: Record<string, string[]>
) {
  return tieGroups.every((group) => {
    const order = resolutions[group.key] ?? [];
    const uniqueNames = new Set(order.filter(Boolean));

    return (
      order.length === group.players.length &&
      uniqueNames.size === group.players.length &&
      group.players.every((player) => uniqueNames.has(player.name))
    );
  });
}

export function applyTieResolutions(
  stats: RankingPlayerStats[],
  tieGroups: TieGroup[],
  resolutions: Record<string, string[]>
): RankingPlayerStats[] {
  const updated = stats.map((stat) => ({ ...stat }));

  for (const group of tieGroups) {
    const order = resolutions[group.key];
    if (!order) continue;

    order.forEach((name, index) => {
      const stat = updated.find((player) => player.name === name);
      if (stat) stat.position = group.positionStart + index;
    });
  }

  return updated.sort((a, b) => a.position - b.position);
}
