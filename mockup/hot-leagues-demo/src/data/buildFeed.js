export const MATCH_LIMIT = 8;

export function visibleSports(catalog, preferredSportId = null) {
  const sports = catalog.sports.filter((sport) => sport.enabled && countSportMatches(catalog, sport.id) > 0);
  if (!preferredSportId) return sports;
  const preferred = sports.filter((sport) => sport.id === preferredSportId);
  const rest = sports.filter((sport) => sport.id !== preferredSportId);
  return [...preferred, ...rest];
}

export function countSportMatches(catalog, sportId) {
  const leagueIds = new Set(
    catalog.leagues.filter((league) => league.enabled && league.sportId === sportId).map((league) => league.id),
  );
  return catalog.matches.filter((match) => leagueIds.has(match.leagueId)).length;
}

export function countAllMatches(catalog) {
  return visibleSports(catalog).reduce((total, sport) => total + countSportMatches(catalog, sport.id), 0);
}

function compareMatches(a, b) {
  if (a.phase !== b.phase) return a.phase === "live" ? -1 : 1;
  return a.kickoff - b.kickoff;
}

export function buildHotLeagueFeed(catalog, sportId) {
  const sport = catalog.sports.find((item) => item.id === sportId);
  if (!sport || !sport.enabled) return [];

  const leagues = catalog.leagues
    .filter((league) => league.enabled && league.sportId === sportId)
    .sort((a, b) => a.rank - b.rank);

  const picked = [];
  for (const league of leagues) {
    const leagueMatches = catalog.matches.filter((match) => match.leagueId === league.id).sort(compareMatches);
    for (const match of leagueMatches) {
      if (picked.length >= MATCH_LIMIT) break;
      picked.push(match);
    }
    if (picked.length >= MATCH_LIMIT) break;
  }

  const showDivider = sport.kind === "regular" && new Set(picked.map((match) => match.leagueId)).size > 1;
  const items = [];
  let previousLeagueId = null;
  let dividerInserted = false;

  for (const match of picked) {
    if (match.leagueId !== previousLeagueId) {
      if (previousLeagueId !== null && showDivider && !dividerInserted) {
        items.push({ type: "divider" });
        dividerInserted = true;
      }
      const league = leagues.find((item) => item.id === match.leagueId);
      items.push({
        type: "tag",
        leagueId: league.id,
        name: league.name,
        icon: league.icon,
        variant: sport.kind,
      });
      previousLeagueId = match.leagueId;
    }
    items.push({ type: "match", match });
  }

  return items;
}
