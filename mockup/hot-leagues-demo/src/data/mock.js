export const scenarioOptions = [
  { id: "full", label: "满 8 场" },
  { id: "backfill", label: "跨联赛递补" },
  { id: "short", label: "不足 8 场" },
  { id: "empty", label: "空态 / OPS 关闭" },
  { id: "preferred", label: "偏好球种" },
];

export const PREFERRED_SPORT_ID = "basketball";

const sports = [
  { id: "football", name: "足球", icon: "assets/football.svg", enabled: true, kind: "regular" },
  { id: "basketball", name: "篮球", icon: "assets/basketball.svg", enabled: true, kind: "regular" },
  { id: "tennis", name: "网球", icon: "assets/tennis.svg", enabled: true, kind: "regular" },
  { id: "table-tennis", name: "乒乓球", icon: "assets/table-tennis.svg", enabled: true, kind: "regular" },
  { id: "esports", name: "电子竞技", icon: "assets/esports.svg", enabled: true, kind: "esports" },
  { id: "esports-sports", name: "电竞体育", icon: "assets/esports-sports.svg", enabled: true, kind: "esports-sports" },
  { id: "badminton", name: "羽毛球", icon: "assets/badminton.svg", enabled: true, kind: "regular" },
  { id: "baseball", name: "棒球", icon: "assets/baseball.svg", enabled: true, kind: "regular" },
];

const leagues = [
  { id: "epl", sportId: "football", name: "英格兰超级联赛", icon: "assets/football.svg", rank: 1, enabled: true },
  { id: "laliga", sportId: "football", name: "西班牙甲级联赛", icon: "assets/laliga.svg", rank: 2, enabled: true },
  { id: "brasileirao", sportId: "football", name: "巴西甲级联赛", icon: "assets/brazil.svg", rank: 3, enabled: true },
  { id: "nba", sportId: "basketball", name: "NBA", icon: "assets/basketball.svg", rank: 1, enabled: true },
  { id: "wta", sportId: "tennis", name: "WTA", icon: "assets/tennis.svg", rank: 1, enabled: true },
  { id: "wtt", sportId: "table-tennis", name: "WTT", icon: "assets/table-tennis.svg", rank: 1, enabled: true },
  { id: "lol", sportId: "esports", name: "英雄联盟", icon: "assets/lol.png", rank: 1, enabled: true },
  { id: "dota", sportId: "esports", name: "刀塔", icon: "assets/dota.svg", rank: 2, enabled: true },
  { id: "efootball", sportId: "esports-sports", name: "电竞足球", icon: "assets/esport-football.png", rank: 1, enabled: true },
  { id: "ebasketball", sportId: "esports-sports", name: "电竞篮球", icon: "assets/esport-basketball.png", rank: 2, enabled: true },
  { id: "bwf", sportId: "badminton", name: "BWF", icon: "assets/badminton.svg", rank: 1, enabled: true },
  { id: "mlb", sportId: "baseball", name: "MLB", icon: "assets/baseball.svg", rank: 1, enabled: true },
];

const odds = [
  { label: "1", price: "1.90" },
  { label: "X", price: "1.90" },
  { label: "2", price: "1.90" },
];

function fixture(id, leagueId, phase, kickoff, home, away, homeScore, awayScore) {
  return {
    id,
    leagueId,
    phase,
    kickoff,
    clock: phase === "live" ? "45:50" : "21:00",
    home,
    away,
    homeScore,
    awayScore,
    marketCount: 128,
    odds,
    halfTime: phase === "live" ? "0-0" : undefined,
    corners: phase === "live" ? "0-0" : undefined,
  };
}

const otherSports = [
  fixture("nba-1", "nba", "live", 1, "凯尔特人", "湖人", 98, 96),
  fixture("nba-2", "nba", "live", 2, "勇士", "掘金", 88, 91),
  fixture("nba-3", "nba", "upcoming", 10, "尼克斯", "雄鹿"),
  fixture("nba-4", "nba", "upcoming", 11, "热火", "76人"),
  fixture("nba-5", "nba", "upcoming", 12, "太阳", "独行侠"),
  fixture("nba-6", "nba", "upcoming", 13, "雷霆", "森林狼"),
  fixture("wta-1", "wta", "live", 1, "斯瓦泰克", "萨巴伦卡", 1, 0),
  fixture("wta-2", "wta", "upcoming", 8, "高芙", "莱巴金娜"),
  fixture("wta-3", "wta", "upcoming", 9, "佩古拉", "郑钦文"),
  fixture("wta-4", "wta", "upcoming", 10, "莱巴金娜", "萨巴伦卡"),
  fixture("wtt-1", "wtt", "live", 1, "樊振东", "王楚钦", 2, 1),
  fixture("wtt-2", "wtt", "upcoming", 6, "孙颖莎", "陈梦"),
  fixture("wtt-3", "wtt", "upcoming", 7, "早田希娜", "伊藤美诚"),
  fixture("lol-1", "lol", "live", 1, "T1", "Gen.G", 1, 0),
  fixture("lol-2", "lol", "upcoming", 5, "BLG", "JDG"),
  fixture("dota-1", "dota", "live", 2, "Spirit", "Falcons", 1, 1),
  fixture("dota-2", "dota", "upcoming", 6, "Liquid", "BetBoom"),
  fixture("efb-1", "efootball", "live", 1, "曼城", "利物浦", 1, 0),
  fixture("efb-2", "efootball", "upcoming", 8, "阿森纳", "热刺"),
  fixture("ebs-1", "ebasketball", "live", 3, "湖人", "凯尔特人", 2, 1),
  fixture("ebs-2", "ebasketball", "upcoming", 9, "勇士", "掘金"),
  fixture("bwf-1", "bwf", "live", 1, "安洗莹", "戴资颖", 1, 0),
  fixture("mlb-1", "mlb", "upcoming", 3, "道奇", "洋基"),
];

const backfillFootball = [
  fixture("epl-1", "epl", "live", 1, "利物浦", "富咸", 3, 3),
  fixture("epl-2", "epl", "live", 2, "阿森纳", "热刺", 1, 1),
  fixture("laliga-1", "laliga", "live", 1, "皇马", "巴萨", 2, 1),
  fixture("laliga-2", "laliga", "live", 2, "马竞", "塞维利亚", 0, 0),
  fixture("laliga-3", "laliga", "upcoming", 20, "毕尔巴鄂", "皇家社会"),
  fixture("laliga-4", "laliga", "upcoming", 21, "瓦伦西亚", "比利亚雷亚尔"),
  fixture("bra-1", "brasileirao", "live", 1, "弗拉门戈", "帕尔梅拉斯", 1, 0),
  fixture("bra-2", "brasileirao", "live", 2, "科林蒂安", "圣保罗", 0, 0),
];

const fullFootball = Array.from({ length: 8 }, (_, index) =>
  fixture(
    `epl-full-${index + 1}`,
    "epl",
    index < 6 ? "live" : "upcoming",
    index + 1,
    index % 2 === 0 ? "曼城" : "阿森纳",
    index % 2 === 0 ? "利物浦" : "热刺",
    index < 6 ? 3 : undefined,
    index < 6 ? 2 : undefined,
  ),
);

const shortFootball = [
  fixture("epl-s1", "epl", "live", 1, "曼城", "利物浦", 3, 2),
  fixture("epl-s2", "epl", "live", 2, "阿森纳", "热刺", 1, 0),
  fixture("laliga-s1", "laliga", "upcoming", 9, "皇马", "巴萨"),
];

export function catalogFor(scenario) {
  const football =
    scenario === "full" ? fullFootball : scenario === "short" ? shortFootball : scenario === "empty" ? [] : backfillFootball;
  const rest = scenario === "empty" ? [] : otherSports;
  return { sports, leagues, matches: [...football, ...rest] };
}
