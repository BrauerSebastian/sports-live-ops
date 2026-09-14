import { PrismaClient, ArticleStatus, EventStatus, IncidentType, NotificationStatus, ParticipantSide, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

function dayOffset(days: number, hour = 12, minute = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, hour, minute, 0));
}

async function main() {
  await prisma.notificationOutbox.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.liveComment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.statistic.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.sportEvent.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.competitionParticipant.deleteMany();
  await prisma.season.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("ChangeMe-Portfolio-2026", 12);
  const [admin, operator, editor] = await Promise.all([
    prisma.user.create({ data: { email: "admin@sports-live-ops.test", displayName: "Avery Chen", role: Role.ADMIN, passwordHash } }),
    prisma.user.create({ data: { email: "operator@sports-live-ops.test", displayName: "Jordan Mitchell", role: Role.OPERATOR, passwordHash } }),
    prisma.user.create({ data: { email: "editor@sports-live-ops.test", displayName: "Mina Alvarez", role: Role.EDITOR, passwordHash } }),
  ]);

  const competition = await prisma.competition.create({ data: { slug: "north-american-league", name: "North American League", region: "North America" } });
  const year = new Date().getUTCFullYear();
  const season = await prisma.season.create({ data: { competitionId: competition.id, name: `${year} Season`, startsOn: dayOffset(-45), endsOn: dayOffset(90), isActive: true } });

  const teams = [
    ["Northbridge FC", "Northbridge", "NFC"],
    ["Eastvale United", "Eastvale", "EUN"],
    ["Harbor City", "Harbor", "HBC"],
    ["Stonewall Athletic", "Stonewall", "SWA"],
    ["Westfield Rovers", "Westfield", "WFR"],
    ["AC Meridian", "Meridian", "ACM"],
    ["Lakeside 04", "Lakeside", "L04"],
    ["Port Union", "Port Union", "PTU"],
  ];
  const participants = Object.fromEntries(await Promise.all(teams.map(async ([name, shortName, code]) => {
    const participant = await prisma.participant.create({ data: { name, shortName, code, competitionEntries: { create: { competitionId: competition.id } } } });
    return [code, participant] as const;
  })));

  const venueData: Array<[string, string, number]> = [
    ["Riverside Stadium", "Northbridge", 18000],
    ["Harbor Bowl", "Harbor City", 12500],
    ["Westfield Park", "Westfield", 9800],
    ["Meridian Ground", "Meridian", 11200],
  ];
  const venues = Object.fromEntries(await Promise.all(venueData.map(async ([name, city, capacity]) => {
    const venue = await prisma.venue.create({ data: { competitionId: competition.id, name, city, capacity } });
    return [name, venue] as const;
  })));

  const createEvent = async (data: { title: string; scheduledAt: Date; status: EventStatus; venue: string; home: string; away: string; minute?: number }) => {
    const startedAt = (data.status === EventStatus.LIVE || data.status === EventStatus.PAUSED || data.status === EventStatus.FINISHED) ? new Date(data.scheduledAt.getTime() + 5 * 60 * 1000) : undefined;
    const endedAt = data.status === EventStatus.FINISHED ? new Date(data.scheduledAt.getTime() + 110 * 60 * 1000) : undefined;
    return prisma.sportEvent.create({
      data: {
        competitionId: competition.id,
        seasonId: season.id,
        venueId: venues[data.venue].id,
        title: data.title,
        scheduledAt: data.scheduledAt,
        status: data.status,
        currentMinute: data.minute ?? 0,
        startedAt,
        endedAt,
        participants: { create: [{ participantId: participants[data.home].id, side: ParticipantSide.HOME }, { participantId: participants[data.away].id, side: ParticipantSide.AWAY }] },
        statistic: { create: {} },
      },
    });
  };

  const liveEvent = await createEvent({ title: "Northbridge FC vs Eastvale United", scheduledAt: new Date(Date.now() - 70 * 60 * 1000), status: EventStatus.LIVE, venue: "Riverside Stadium", home: "NFC", away: "EUN", minute: 64 });
  await prisma.incident.createMany({ data: [
    { eventId: liveEvent.id, type: IncidentType.GOAL, minute: 12, participantId: participants.NFC.id, playerName: "L. Okafor", assistName: "M. Reed", detail: "Opening goal", createdById: operator.id },
    { eventId: liveEvent.id, type: IncidentType.YELLOW_CARD, minute: 28, participantId: participants.EUN.id, playerName: "M. Costa", detail: "Late challenge", createdById: operator.id },
  ] });
  await prisma.liveComment.createMany({ data: [
    { eventId: liveEvent.id, authorId: operator.id, minute: 64, body: "Northbridge are controlling the tempo through the middle third." },
    { eventId: liveEvent.id, authorId: operator.id, minute: 62, body: "A quick Eastvale counter is cleared at the near post." },
  ] });
  await prisma.statistic.update({ where: { eventId: liveEvent.id }, data: { homePossession: 54, awayPossession: 46, homeShots: 8, awayShots: 6, homeShotsOnTarget: 4, awayShotsOnTarget: 2, homeCorners: 5, awayCorners: 3, homeFouls: 9, awayFouls: 11 } });

  const historicalNorthbridge = await createEvent({ title: "Northbridge FC vs Eastvale United", scheduledAt: dayOffset(-7, 19, 30), status: EventStatus.FINISHED, venue: "Riverside Stadium", home: "NFC", away: "EUN", minute: 90 });
  const historicalHarbor = await createEvent({ title: "Harbor City vs Stonewall Athletic", scheduledAt: dayOffset(-6, 18), status: EventStatus.FINISHED, venue: "Harbor Bowl", home: "HBC", away: "SWA", minute: 90 });
  const historicalWestfield = await createEvent({ title: "Westfield Rovers vs AC Meridian", scheduledAt: dayOffset(-6, 20), status: EventStatus.FINISHED, venue: "Westfield Park", home: "WFR", away: "ACM", minute: 90 });
  await createEvent({ title: "Lakeside 04 vs Port Union", scheduledAt: dayOffset(-5, 19), status: EventStatus.FINISHED, venue: "Meridian Ground", home: "L04", away: "PTU", minute: 90 });
  await prisma.incident.createMany({ data: [
    { eventId: historicalNorthbridge.id, type: IncidentType.GOAL, minute: 23, participantId: participants.NFC.id, playerName: "L. Okafor", createdById: operator.id },
    { eventId: historicalNorthbridge.id, type: IncidentType.GOAL, minute: 61, participantId: participants.NFC.id, playerName: "D. Vale", createdById: operator.id },
    { eventId: historicalNorthbridge.id, type: IncidentType.GOAL, minute: 76, participantId: participants.EUN.id, playerName: "A. Holt", createdById: operator.id },
    { eventId: historicalHarbor.id, type: IncidentType.GOAL, minute: 17, participantId: participants.HBC.id, playerName: "R. Bell", createdById: operator.id },
    { eventId: historicalHarbor.id, type: IncidentType.GOAL, minute: 48, participantId: participants.HBC.id, playerName: "J. Field", createdById: operator.id },
    { eventId: historicalHarbor.id, type: IncidentType.GOAL, minute: 70, participantId: participants.SWA.id, playerName: "K. Dunn", createdById: operator.id },
    { eventId: historicalWestfield.id, type: IncidentType.GOAL, minute: 32, participantId: participants.WFR.id, playerName: "M. Lane", createdById: operator.id },
    { eventId: historicalWestfield.id, type: IncidentType.GOAL, minute: 55, participantId: participants.ACM.id, playerName: "P. Rowe", createdById: operator.id },
  ] });

  await createEvent({ title: "Harbor City vs Stonewall Athletic", scheduledAt: dayOffset(0, 20, 30), status: EventStatus.SCHEDULED, venue: "Harbor Bowl", home: "HBC", away: "SWA" });
  await createEvent({ title: "Westfield Rovers vs AC Meridian", scheduledAt: dayOffset(1, 18), status: EventStatus.SCHEDULED, venue: "Westfield Park", home: "WFR", away: "ACM" });
  await createEvent({ title: "Lakeside 04 vs Port Union", scheduledAt: dayOffset(1, 20), status: EventStatus.SCHEDULED, venue: "Meridian Ground", home: "L04", away: "PTU" });

  const standings = [
    ["NFC", 1, 1, 0, 0, 2, 1, 1, 3], ["HBC", 1, 1, 0, 0, 2, 1, 1, 3], ["WFR", 1, 0, 1, 0, 1, 1, 0, 1], ["ACM", 1, 0, 1, 0, 1, 1, 0, 1], ["L04", 1, 0, 1, 0, 0, 0, 0, 1], ["PTU", 1, 0, 1, 0, 0, 0, 0, 1], ["EUN", 1, 0, 0, 1, 1, 2, -1, 0], ["SWA", 1, 0, 0, 1, 1, 2, -1, 0],
  ];
  await prisma.standing.createMany({ data: standings.map(([code, played, wins, draws, losses, goalsFor, goalsAgainst, goalDifference, points]) => ({ seasonId: season.id, participantId: participants[code as string].id, played: played as number, wins: wins as number, draws: draws as number, losses: losses as number, goalsFor: goalsFor as number, goalsAgainst: goalsAgainst as number, goalDifference: goalDifference as number, points: points as number })) });

  const article = await prisma.newsArticle.create({ data: { slug: "northbridge-hold-the-line", title: "Northbridge hold the line in a tense Riverside night", summary: "A disciplined Northbridge side take all three points in the latest league round.", body: "Northbridge FC defended their advantage with composure at Riverside Stadium. The result keeps the fictional North American League table tightly contested.", status: ArticleStatus.PUBLISHED, publishedAt: new Date(Date.now() - 2 * DAY), authorId: editor.id, competitionId: competition.id, eventId: historicalNorthbridge.id } });
  await prisma.newsArticle.create({ data: { slug: "riverside-live-desk", title: "Live desk: Northbridge protect a narrow lead", summary: "The operations desk tracks a tight second half at Riverside with Northbridge one goal ahead.", body: "Northbridge carry a narrow advantage into the closing stages at Riverside Stadium. Follow the live event page for incidents, commentary, match time, and statistics as the fictional match develops.", status: ArticleStatus.PUBLISHED, publishedAt: new Date(Date.now() - 20 * 60 * 1000), authorId: editor.id, competitionId: competition.id, eventId: liveEvent.id } });
  await prisma.newsArticle.create({ data: { slug: "next-round-preview", title: "Next round: four fixtures under the lights", summary: "The next round brings a busy schedule across the North American League.", body: "Operators are preparing the next set of fixtures across the region, with live coverage available through the competition center.", status: ArticleStatus.DRAFT, authorId: editor.id, competitionId: competition.id } });

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SEED_COMPLETED", entityType: "Competition", entityId: competition.id, metadata: { liveEventId: liveEvent.id } } });
  await prisma.notificationOutbox.create({ data: { eventId: liveEvent.id, createdById: operator.id, type: "EVENT_STARTED", audience: "PUBLIC_FOLLOWERS", payload: { title: liveEvent.title, status: liveEvent.status }, status: NotificationStatus.PENDING } });
  console.log(`Seeded ${competition.name} with live event ${liveEvent.id} and article ${article.id}`);
  console.log("Demo accounts: admin@sports-live-ops.test, operator@sports-live-ops.test, editor@sports-live-ops.test");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
