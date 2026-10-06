import { buildHotLeagueFeed, countAllMatches, visibleSports } from "./data/buildFeed.js";
import { PREFERRED_SPORT_ID, catalogFor, scenarioOptions } from "./data/mock.js";

const STRIDE = 52;

const scenarioNotices = {
  full: "第一联赛已满 8 场，不跨联赛递补，没有分隔线。",
  backfill: "英超不足 8 场，由西甲、巴甲递补。分隔线只在第一与第二联赛之间。",
  short: "合计不足 8 场，仍保留跨联赛分隔线。",
  empty: "没有赛事且 OPS 关闭，热门联赛区已隐藏。",
  preferred: "偏好球种为篮球，已排到 Icon 列第一位。右侧数字进入该球种联赛列表。",
};

const state = {
  scenario: "backfill",
  selectedSportId: "football",
  notice: scenarioNotices.backfill,
  indicatorX: 0,
};

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
    head.innerHTML = `<img src="${league.icon}" alt="" /><span>${league.name}</span>`;
    card.append(head);
  }

  const main = el("div", "card-main");
  main.append(el("time", "match-clock", match.clock));

  const names = el("div", "team-col");
  names.append(el("p", "", match.home), el("p", "", match.away));

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
    playWide.setAttribute("aria-label", "直播");
    playWide.innerHTML = `<img class="play-thumb" src="assets/play-thumb.png" alt="" /><img class="play-glyph" src="assets/play-icon.svg" alt="" />`;
    tools.append(playWide);
  }
  tools.insertAdjacentHTML("beforeend", `<span class="tool-share-wrap"><img class="tool-share" src="assets/share-figma.svg" alt="" /></span><img class="tool-bookmark" src="assets/bookmark.svg" alt="" />`);
  side.append(tools);
  side.append(el("span", "market-count", String(match.marketCount)));
  if (live) {
    const play = el("span", "play-btn");
    play.setAttribute("aria-label", "直播");
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
  section.setAttribute("aria-label", "热门联赛");
  const header = el("header", "hot-header");
  header.append(el("h1", "", "热门联赛"));
  const count = el("button", "count-btn");
  count.type = "button";
  count.append(el("span", "", String(countAllMatches(catalog))));
  count.insertAdjacentHTML("beforeend", `<img src="assets/arrow.svg" alt="" />`);
  count.addEventListener("click", () => {
    const sport = sports[0];
    state.notice = `Demo：进入${sport?.name ?? ""}联赛列表。`;
    render();
  });
  header.append(count);

  const rail = el("div", "icon-rail");
  rail.setAttribute("role", "tablist");
  rail.setAttribute("aria-label", "球种");
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
    button.setAttribute("aria-label", sport.name);
    button.innerHTML = `<img src="${sport.icon}" alt="" />`;
    button.addEventListener("click", () => {
      if (state.selectedSportId === sport.id) return;
      state.selectedSportId = sport.id;
      if (sport.kind === "esports") {
        state.notice = "电子竞技显示游戏项目标签，例如英雄联盟，项目之间没有分隔线。";
      } else if (sport.kind === "esports-sports") {
        state.notice = "电竞体育显示项目标签，例如电竞足球，项目之间没有分隔线。";
      } else {
        state.notice = `已切换到${sport.name}的热门赛事。`;
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
      divider.innerHTML = `<i></i><span>以下可能是你感兴趣的其他联赛</span><i></i>`;
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
      tag.innerHTML = `<img src="${pendingLeague.icon}" alt="" /><span>${pendingLeague.name}</span>`;
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

  root.replaceChildren();
  const page = el("main", "page");
  const bar = el("div", "demo-bar");
  bar.append(el("p", "", "阶段 1 Demo · 只含热门联赛区块"));
  const row = el("div", "demo-row");
  for (const option of scenarioOptions) {
    const button = el("button", state.scenario === option.id ? "demo-btn active" : "demo-btn", option.label);
    button.type = "button";
    button.addEventListener("click", () => {
      state.scenario = option.id;
      state.selectedSportId = option.id === "preferred" ? PREFERRED_SPORT_ID : "football";
      state.indicatorX = 0;
      state.notice = scenarioNotices[option.id];
      render();
    });
    row.append(button);
  }
  bar.append(row, el("p", "notice", state.notice));

  const stage = el("div", "stage");
  if (opsOn && activeSport) stage.append(renderSection(catalog, sports, activeSport));
  else stage.append(el("div", "hidden-state", "热门联赛区已隐藏"));

  page.append(bar, stage);
  root.append(page);
}

render();
