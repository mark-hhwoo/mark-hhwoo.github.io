import { buildHotLeagueFeed, countAllMatches, visibleSports } from "./data/buildFeed.js";
import { copy, locales, translate } from "./data/i18n.js";
import { PREFERRED_SPORT_ID, catalogFor, scenarioOptions } from "./data/mock.js";

const STRIDE = 52;

const state = {
  locale: "zh-Hans",
  scenario: "backfill",
  selectedSportId: "football",
  notice: { id: "backfill" },
  indicatorX: 0,
};

function text(value) {
  return translate(state.locale, value);
}

function noticeText() {
  const message = copy(state.locale).notice[state.notice.id];
  return typeof message === "function" ? message(text(state.notice.sport ?? "")) : message;
}

const root = document.querySelector("#root");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function scoreClass(score, other) {
  if (score === undefined || other === undefined) return "score";
  return score >= other ? "score leading" : "score";
}

function matchCard(match, league) {
  const live = match.phase === "live";
  const card = el("article", "match-card");

  if (league) {
    const head = el("div", "card-league");
    const icon = el("img");
    icon.src = league.icon;
    icon.alt = "";
    const leagueName = text(league.name);
    const label = el("span", "", leagueName);
    label.title = leagueName;
    head.append(icon, label);
    card.append(head);
  }

  const main = el("div", "card-main");
  main.append(el("time", "match-clock", match.clock));

  const names = el("div", "team-col");
  for (const team of [match.home, match.away]) {
    const name = text(team);
    const line = el("p", "", name);
    line.title = name;
    names.append(line);
  }

  const scores = el("div", "score-col");
  if (live) {
    scores.append(
      el("span", scoreClass(match.homeScore, match.awayScore), String(match.homeScore)),
      el("span", scoreClass(match.awayScore, match.homeScore), String(match.awayScore)),
    );
  }

  const side = el("div", "card-side");
  const tools = el("div", "wide-tools");
  if (live) {
    const playWide = el("span", "play-wide");
    playWide.setAttribute("aria-label", copy(state.locale).live);
    playWide.innerHTML = `<img class="play-thumb" src="assets/play-thumb.png" alt="" /><img class="play-glyph" src="assets/play-icon.svg" alt="" />`;
    tools.append(playWide);
  }
  tools.insertAdjacentHTML("beforeend", `<span class="tool-share-wrap"><img class="tool-share" src="assets/share-figma.svg" alt="" /></span><img class="tool-bookmark" src="assets/bookmark.svg" alt="" />`);
  side.append(tools);
  side.append(el("span", "market-count", String(match.marketCount)));
  if (live) {
    const play = el("span", "play-btn");
    play.setAttribute("aria-label", copy(state.locale).live);
    play.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#009440"/><path d="M9.5 7.5v9l8-4.5-8-4.5z" fill="#fff"/></svg>`;
    side.append(play);
  }

  const rule = () => el("span", "v-rule");
  main.append(rule(), names, scores, rule(), side);

  const odds = el("div", "odds");
  for (const odd of match.odds) {
    const button = el("button", "odds-btn");
    button.type = "button";
    button.append(el("span", "", odd.label), el("strong", "", odd.price));
    odds.append(button);
  }

  card.append(main, odds);
  return card;
}

function renderSection(catalog, sports, activeSport) {
  const section = el("section", "hot-leagues");
  const strings = copy(state.locale);
  section.setAttribute("aria-label", strings.title);
  const header = el("header", "hot-header");
  header.append(el("h1", "", strings.title));
  const count = el("button", "count-btn");
  count.type = "button";
  count.append(el("span", "", String(countAllMatches(catalog))));
  count.insertAdjacentHTML("beforeend", `<img src="assets/arrow.svg" alt="" />`);
  count.addEventListener("click", () => {
    const sport = sports[0];
    state.notice = { id: "enter", sport: sport?.name ?? "" };
    render();
  });
  header.append(count);

  const rail = el("div", "icon-rail");
  rail.setAttribute("role", "tablist");
  rail.setAttribute("aria-label", strings.sportsLabel);
  const selectedIndex = Math.max(0, sports.findIndex((sport) => sport.id === activeSport));
  const indicator = el("span", "sport-indicator");
  indicator.style.transform = `translateX(${state.indicatorX}px)`;
  rail.append(indicator);
  sports.forEach((sport, index) => {
    const selected = sport.id === activeSport;
    const button = el("button", selected ? "sport-btn selected" : "sport-btn");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(selected));
    button.setAttribute("aria-label", text(sport.name));
    button.innerHTML = `<img src="${sport.icon}" alt="" />`;
    button.addEventListener("click", () => {
      if (state.selectedSportId === sport.id) return;
      state.selectedSportId = sport.id;
      if (sport.kind === "esports") {
        state.notice = { id: "esports" };
      } else if (sport.kind === "esports-sports") {
        state.notice = { id: "esportsSports" };
      } else {
        state.notice = { id: "switched", sport: sport.name };
      }
      render();
    });
    rail.append(button);
    if (selected && index > 0) {
      requestAnimationFrame(() => button.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" }));
    }
  });
  const nextX = selectedIndex * STRIDE;
  requestAnimationFrame(() => {
    indicator.style.transform = `translateX(${nextX}px)`;
    state.indicatorX = nextX;
  });

  const feed = el("div", "feed");
  const items = buildHotLeagueFeed(catalog, activeSport);
  let pendingLeague = null;
  let group = null;
  items.forEach((item) => {
    if (item.type === "divider") {
      group = null;
      const divider = el("div", "divider");
      divider.innerHTML = `<i></i><span title="${strings.divider}">${strings.divider}</span><i></i>`;
      feed.append(divider);
      return;
    }
    if (item.type === "tag") {
      pendingLeague = item;
      group = null;
      return;
    }
    const outsideTag = pendingLeague && pendingLeague.variant !== "regular";
    if (pendingLeague) {
      group = el("div", "item-group");
      const tag = el("div", `item-tag item-tag-${pendingLeague.variant}`);
      const leagueName = text(pendingLeague.name);
      const icon = el("img");
      icon.src = pendingLeague.icon;
      icon.alt = "";
      const label = el("span", "", leagueName);
      label.title = leagueName;
      tag.append(icon, label);
      group.append(tag);
      feed.append(group);
    }
    const card = matchCard(item.match, pendingLeague && !outsideTag ? pendingLeague : null);
    if (group) group.append(card);
    else feed.append(card);
    pendingLeague = null;
  });

  section.append(header, rail, feed);
  return section;
}

function render() {
  const catalog = catalogFor(state.scenario);
  const opsOn = state.scenario !== "empty";
  const preferredSportId = state.scenario === "preferred" ? PREFERRED_SPORT_ID : null;
  const sports = visibleSports(catalog, preferredSportId);
  const activeSport = sports.some((sport) => sport.id === state.selectedSportId) ? state.selectedSportId : (sports[0]?.id ?? null);

  const strings = copy(state.locale);
  document.documentElement.lang = state.locale;
  document.title = `${strings.title} Demo`;
  root.replaceChildren();
  const page = el("main", "page");
  page.append(el("p", "disclaimer", strings.disclaimer));
  const bar = el("div", "demo-bar");
  bar.append(el("p", "", strings.intro));
  const languages = el("div", "demo-row");
  languages.setAttribute("role", "group");
  languages.setAttribute("aria-label", strings.language);
  for (const locale of locales) {
    const button = el("button", state.locale === locale.id ? "demo-btn active" : "demo-btn", locale.label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(state.locale === locale.id));
    button.addEventListener("click", () => {
      if (state.locale === locale.id) return;
      state.locale = locale.id;
      render();
    });
    languages.append(button);
  }
  const row = el("div", "demo-row");
  for (const option of scenarioOptions) {
    const button = el("button", state.scenario === option.id ? "demo-btn active" : "demo-btn", strings.scenario[option.id]);
    button.type = "button";
    button.addEventListener("click", () => {
      state.scenario = option.id;
      state.selectedSportId = option.id === "preferred" ? PREFERRED_SPORT_ID : "football";
      state.indicatorX = 0;
      state.notice = { id: option.id };
      render();
    });
    row.append(button);
  }
  bar.append(languages, row, el("p", "notice", noticeText()));

  const stage = el("div", "stage");
  if (opsOn && activeSport) stage.append(renderSection(catalog, sports, activeSport));
  else stage.append(el("div", "hidden-state", strings.hidden));

  page.append(bar, stage);
  root.append(page);
}

render();
