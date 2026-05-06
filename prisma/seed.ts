import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// ============================================================
// Authentic Hunza Valley seed data
// ============================================================

const VILLAGES = [
  { name: "Karimabad", slug: "karimabad", region: "Hunza", lat: 36.3167, lng: 74.6597, historicalNotes: "Former capital of the Hunza princely state, home to the Baltit Fort. Known as the crown jewel of Hunza.", documentationStatus: "partial" },
  { name: "Altit", slug: "altit", region: "Hunza", lat: 36.3131, lng: 74.6653, historicalNotes: "Home to the Altit Fort, one of the oldest structures in Hunza. The ancestral seat of the Hunza royal family.", documentationStatus: "partial" },
  { name: "Ganesh", slug: "ganesh", region: "Hunza", lat: 36.3100, lng: 74.6500, historicalNotes: "One of the oldest settlements in Hunza, known for its sacred rock carvings and ancient watchtowers.", documentationStatus: "pending" },
  { name: "Gulmit", slug: "gulmit", region: "Gojal (Upper Hunza)", lat: 36.3947, lng: 74.8639, historicalNotes: "Capital of the Gojal region in Upper Hunza, known for its Wakhi heritage and the Ondra Poygah fort.", documentationStatus: "partial" },
  { name: "Shimshal", slug: "shimshal", region: "Gojal (Upper Hunza)", lat: 36.4333, lng: 75.3000, historicalNotes: "The highest settlement in Hunza at 3,100m. Known for its Pamir-grazing tradition and self-reliance.", documentationStatus: "pending" },
];

const CLAN_NAMES = [
  { name: "Diramiting", slug: "diramiting", originStory: "One of the oldest Burusho clans, tracing lineage to the legendary founders of Hunza. Traditionally held positions of governance.", villageIndex: 0 },
  { name: "Barataling", slug: "barataling", originStory: "An ancient Burusho lineage associated with Altit. Known for their role as guardians of the Altit Fort across generations.", villageIndex: 1 },
  { name: "Khurukutz", slug: "khurukutz", originStory: "A prominent Burusho clan of Karimabad, with deep roots in trade along the Silk Road and agricultural stewardship.", villageIndex: 0 },
  { name: "Tharoding", slug: "tharoding", originStory: "A Ganesh-based lineage known for scholarly traditions, stone carving, and preservation of oral histories.", villageIndex: 2 },
  { name: "Baricho", slug: "baricho", originStory: "A Wakhi clan of Gulmit with pastoral roots, known for yak herding and high-altitude trade routes.", villageIndex: 3 },
  { name: "Shoghoning", slug: "shoghoning", originStory: "A distinguished Burusho clan from Karimabad, historically involved in diplomacy and inter-valley relations.", villageIndex: 0 },
  { name: "Gutshoping", slug: "gutshoping", originStory: "An Altit-based clan with traditions of craftsmanship, particularly woodworking and architectural heritage.", villageIndex: 1 },
  { name: "Shimshali", slug: "shimshali", originStory: "The founding families of Shimshal village, known for mountaineering traditions and pastoral resilience.", villageIndex: 4 },
];

// Authentic Burusho / Wakhi / Hunzai names
const MALE_NAMES = [
  "Ghulam Raza", "Shah Baig", "Ayub Khan", "Qurban Ali", "Daulat Amin",
  "Nazir Ahmed", "Ghulam Nabi", "Mohammad Ali", "Sultan Hussain", "Karim Dad",
  "Wazir Baig", "Aman Shah", "Fazal Karim", "Rahim Khan", "Hassan Ali",
  "Shams-ud-Din", "Mir Hamza", "Saleem Khan", "Iqbal Hussain", "Javed Ahmed",
  "Arif Shah", "Nadir Ali", "Zahoor Ahmed", "Bashir Khan", "Murad Ali",
  "Ibrahim Shah", "Akbar Khan", "Yaqoob Ali", "Sher Baig", "Dost Mohammad",
  "Nisar Ahmed", "Rehmat Ali", "Fida Hussain", "Tashkil Ahmad", "Barkat Ali",
  "Shafa Ali", "Mumtaz Hussain", "Liaqat Ali", "Dilshad Khan", "Imran Shah",
  "Aziz Ahmed", "Habib-ur-Rehman", "Sakhi Dad", "Gulzar Ahmed", "Noor Mohammad",
  "Haider Ali", "Zulfiqar Shah", "Farman Ali", "Safdar Hussain", "Wali Khan",
  "Ataullah Shah", "Muzaffar Ali", "Rustam Khan", "Jamil Ahmed", "Nasir Shah",
  "Khurshid Ali", "Babar Khan", "Mehtab Ali", "Gohar Shah", "Rafiq Ahmed",
];

const FEMALE_NAMES = [
  "Bibi Zainab", "Gulshan Bibi", "Naseem Bano", "Fatima Bibi", "Sakina Bano",
  "Zarina Bibi", "Noor Bibi", "Pari Gul", "Dil Bibi", "Amina Bano",
  "Razia Bibi", "Shehnaz Bibi", "Meher Bano", "Kubra Bibi", "Shams Bibi",
  "Gul Bibi", "Sultana Bano", "Taj Bibi", "Sughra Bibi", "Bibi Khatoon",
  "Roshan Bano", "Hamida Bibi", "Nargis Bano", "Zuhra Bibi", "Parween Bano",
  "Sadia Bibi", "Laila Bano", "Bibi Hajra", "Mumtaz Bibi", "Rehana Bano",
  "Shaista Bibi", "Bibi Rabia", "Dilshad Bano", "Maryam Bibi", "Samina Bano",
  "Afshan Bibi", "Tasleem Bano", "Bibi Ruqayya", "Gul Naz", "Nazneen Bibi",
];

interface PersonSeed {
  fullName: string;
  gender: string;
  birthYear: number;
  birthPlace: string;
  deathYear: number | null;
  isLiving: boolean;
  verified: boolean;
  birthYearApproximate: boolean;
  villageIndex: number;
  clanIndex: number;
  generation: number;
}

function buildPersons(): PersonSeed[] {
  const persons: PersonSeed[] = [];
  let maleIdx = 0;
  let femaleIdx = 0;

  // For each clan, build a 6-generation family tree
  for (let clanIdx = 0; clanIdx < 8; clanIdx++) {
    const villageIdx = CLAN_NAMES[clanIdx].villageIndex;

    // Generation 1 (founders, ~1860s) — 1 couple
    const g1MaleName = MALE_NAMES[maleIdx++ % MALE_NAMES.length];
    const g1FemaleName = FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
    persons.push({ fullName: g1MaleName, gender: "male", birthYear: 1850 + clanIdx * 3, birthPlace: VILLAGES[villageIdx].name, deathYear: 1920 + clanIdx * 2, isLiving: false, verified: true, birthYearApproximate: true, villageIndex: villageIdx, clanIndex: clanIdx, generation: 1 });
    persons.push({ fullName: g1FemaleName, gender: "female", birthYear: 1855 + clanIdx * 3, birthPlace: VILLAGES[villageIdx].name, deathYear: 1925 + clanIdx * 2, isLiving: false, verified: true, birthYearApproximate: true, villageIndex: villageIdx, clanIndex: clanIdx, generation: 1 });

    // Generation 2 (~1890s) — 3 children
    for (let c = 0; c < 3; c++) {
      const isMale = c < 2;
      const name = isMale ? MALE_NAMES[maleIdx++ % MALE_NAMES.length] : FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
      persons.push({ fullName: name, gender: isMale ? "male" : "female", birthYear: 1885 + clanIdx * 2 + c * 3, birthPlace: VILLAGES[villageIdx].name, deathYear: 1960 + c * 5, isLiving: false, verified: true, birthYearApproximate: true, villageIndex: villageIdx, clanIndex: clanIdx, generation: 2 });
    }

    // Generation 3 (~1920s) — 4 people (2 children from first G2 son + spouse)
    for (let c = 0; c < 4; c++) {
      const isMale = c % 2 === 0;
      const name = isMale ? MALE_NAMES[maleIdx++ % MALE_NAMES.length] : FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
      persons.push({ fullName: name, gender: isMale ? "male" : "female", birthYear: 1918 + clanIdx * 2 + c * 2, birthPlace: VILLAGES[villageIdx].name, deathYear: c < 2 ? 1995 + c * 3 : null, isLiving: c >= 2 ? false : false, verified: true, birthYearApproximate: c < 2, villageIndex: villageIdx, clanIndex: clanIdx, generation: 3 });
    }

    // Generation 4 (~1950s) — 6 people
    for (let c = 0; c < 6; c++) {
      const isMale = c < 3;
      const name = isMale ? MALE_NAMES[maleIdx++ % MALE_NAMES.length] : FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
      const deathYear = c === 0 ? 2015 : null;
      persons.push({ fullName: name, gender: isMale ? "male" : "female", birthYear: 1948 + clanIdx + c * 2, birthPlace: VILLAGES[villageIdx].name, deathYear, isLiving: !deathYear, verified: c < 3, birthYearApproximate: false, villageIndex: villageIdx, clanIndex: clanIdx, generation: 4 });
    }

    // Generation 5 (~1980s) — 5 people
    for (let c = 0; c < 5; c++) {
      const isMale = c % 2 === 0;
      const name = isMale ? MALE_NAMES[maleIdx++ % MALE_NAMES.length] : FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
      persons.push({ fullName: name, gender: isMale ? "male" : "female", birthYear: 1978 + clanIdx + c * 2, birthPlace: VILLAGES[villageIdx].name, deathYear: null, isLiving: true, verified: c < 2, birthYearApproximate: false, villageIndex: villageIdx, clanIndex: clanIdx, generation: 5 });
    }

    // Generation 6 (~2005+) — 5 people
    for (let c = 0; c < 5; c++) {
      const isMale = c < 3;
      const name = isMale ? MALE_NAMES[maleIdx++ % MALE_NAMES.length] : FEMALE_NAMES[femaleIdx++ % FEMALE_NAMES.length];
      persons.push({ fullName: name, gender: isMale ? "male" : "female", birthYear: 2003 + clanIdx + c * 2, birthPlace: VILLAGES[villageIdx].name, deathYear: null, isLiving: true, verified: false, birthYearApproximate: false, villageIndex: villageIdx, clanIndex: clanIdx, generation: 6 });
    }
  }

  return persons;
}

async function main() {
  console.log("🌱 Seeding Silsila database...\n");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.source.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.clan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.village.deleteMany();

  // --- VILLAGES ---
  console.log("🏔️  Creating villages...");
  const villages = [];
  for (const v of VILLAGES) {
    const village = await prisma.village.create({ data: v });
    villages.push(village);
  }
  console.log(`   ✓ ${villages.length} villages created`);

  // --- CLANS (without founding ancestor for now) ---
  console.log("🏛️  Creating clans...");
  const clans = [];
  for (const c of CLAN_NAMES) {
    const clan = await prisma.clan.create({
      data: {
        name: c.name,
        slug: c.slug,
        originStory: c.originStory,
        villageId: villages[c.villageIndex].id,
      },
    });
    clans.push(clan);
  }
  console.log(`   ✓ ${clans.length} clans created`);

  // --- USERS ---
  console.log("👤 Creating users...");
  const passwordHash = hashSync("password123", 10);
  const superAdmin = await prisma.user.create({
    data: { name: "Mir Alam Khan", email: "admin@silsila.app", passwordHash, role: "super_admin", villageId: villages[0].id, verifiedContributor: true, emailVerified: true },
  });
  const villageAdmin = await prisma.user.create({
    data: { name: "Rehmat Karim", email: "karimabad@silsila.app", passwordHash, role: "village_admin", villageId: villages[0].id, verifiedContributor: true, emailVerified: true },
  });
  const contributor = await prisma.user.create({
    data: { name: "Nadia Shah", email: "nadia@example.com", passwordHash, role: "contributor", villageId: villages[1].id, verifiedContributor: true, emailVerified: true },
  });
  console.log("   ✓ 3 users created (super_admin, village_admin, contributor)");

  // --- PERSONS ---
  console.log("👥 Creating persons...");
  const personSeeds = buildPersons();
  const personRecords = [];

  for (const p of personSeeds) {
    const person = await prisma.person.create({
      data: {
        fullName: p.fullName,
        gender: p.gender,
        birthYear: p.birthYear,
        birthYearApproximate: p.birthYearApproximate,
        birthPlace: p.birthPlace,
        deathYear: p.deathYear,
        isLiving: p.isLiving,
        verified: p.verified,
        privacyLevel: p.isLiving ? "family" : "public",
        villageId: villages[p.villageIndex].id,
        clanId: clans[p.clanIndex].id,
        addedById: superAdmin.id,
      },
    });
    personRecords.push({ ...person, generation: p.generation, clanIndex: p.clanIndex });
  }
  console.log(`   ✓ ${personRecords.length} persons created`);

  // --- Link founding ancestors to clans ---
  console.log("🔗 Linking founding ancestors to clans...");
  for (let i = 0; i < 8; i++) {
    const founder = personRecords.find((p) => p.clanIndex === i && p.generation === 1);
    if (founder) {
      await prisma.clan.update({ where: { id: clans[i].id }, data: { foundingAncestorId: founder.id } });
    }
  }

  // --- RELATIONSHIPS ---
  console.log("💍 Creating relationships...");
  let relCount = 0;

  // For each clan, wire up parent-child and spouse relationships
  for (let clanIdx = 0; clanIdx < 8; clanIdx++) {
    const clanPersons = personRecords.filter((p) => p.clanIndex === clanIdx);
    const byGen = (gen: number) => clanPersons.filter((p) => p.generation === gen);

    const g1 = byGen(1); // 2 people (couple)
    const g2 = byGen(2); // 3 children
    const g3 = byGen(3); // 4 people
    const g4 = byGen(4); // 5 people
    const g5 = byGen(5); // 5 people
    const g6 = byGen(6); // 4 people

    // G1 couple (spouse)
    if (g1.length >= 2) {
      await prisma.relationship.create({ data: { personAId: g1[0].id, personBId: g1[1].id, relationshipType: "spouse", startYear: g1[0].birthYear ? g1[0].birthYear + 18 : undefined, isVerified: true } });
      relCount++;
    }

    // G1 → G2 parent-child
    for (const child of g2) {
      if (g1[0]) { await prisma.relationship.create({ data: { personAId: g1[0].id, personBId: child.id, relationshipType: "parent", isVerified: true } }); relCount++; }
      if (g1[1]) { await prisma.relationship.create({ data: { personAId: g1[1].id, personBId: child.id, relationshipType: "parent", isVerified: true } }); relCount++; }
    }

    // G2[0] + spouse → G3 children (first G2 male starts family)
    if (g2.length >= 1 && g3.length >= 2) {
      // G2[0] spouse (use G3[1] as incoming spouse from different lineage — or just create parent links)
      for (let c = 0; c < Math.min(g3.length, 3); c++) {
        await prisma.relationship.create({ data: { personAId: g2[0].id, personBId: g3[c].id, relationshipType: "parent", isVerified: true } });
        relCount++;
      }
    }

    // G3[0] + spouse → G4 children
    if (g3.length >= 2 && g4.length >= 1) {
      // Spouse pair
      await prisma.relationship.create({ data: { personAId: g3[0].id, personBId: g3[1].id, relationshipType: "spouse", startYear: g3[0].birthYear ? g3[0].birthYear + 22 : undefined, isVerified: true } });
      relCount++;
      for (let c = 0; c < Math.min(g4.length, 4); c++) {
        await prisma.relationship.create({ data: { personAId: g3[0].id, personBId: g4[c].id, relationshipType: "parent", isVerified: true } });
        relCount++;
        await prisma.relationship.create({ data: { personAId: g3[1].id, personBId: g4[c].id, relationshipType: "parent", isVerified: true } });
        relCount++;
      }
    }

    // G4[0] + G4[1] spouse → G5 children
    if (g4.length >= 2 && g5.length >= 1) {
      await prisma.relationship.create({ data: { personAId: g4[0].id, personBId: g4[1].id, relationshipType: "spouse", startYear: g4[0].birthYear ? g4[0].birthYear + 24 : undefined, isVerified: true } });
      relCount++;
      for (let c = 0; c < Math.min(g5.length, 3); c++) {
        await prisma.relationship.create({ data: { personAId: g4[0].id, personBId: g5[c].id, relationshipType: "parent", isVerified: true } });
        relCount++;
      }
    }

    // G5[0] + G5[1] spouse → G6 children
    if (g5.length >= 2 && g6.length >= 1) {
      await prisma.relationship.create({ data: { personAId: g5[0].id, personBId: g5[1].id, relationshipType: "spouse", startYear: g5[0].birthYear ? g5[0].birthYear + 25 : undefined, isVerified: true } });
      relCount++;
      for (let c = 0; c < Math.min(g6.length, 3); c++) {
        await prisma.relationship.create({ data: { personAId: g5[0].id, personBId: g6[c].id, relationshipType: "parent" } });
        relCount++;
      }
    }
  }
  console.log(`   ✓ ${relCount} relationships created`);

  // --- MEDIA ITEMS ---
  console.log("📸 Creating media items...");
  const selectedPersons = personRecords.filter((_, i) => i % 10 === 0).slice(0, 20);
  for (let i = 0; i < 20; i++) {
    const person = selectedPersons[i % selectedPersons.length];
    await prisma.mediaItem.create({
      data: {
        personId: person.id,
        type: i < 14 ? "photo" : i < 18 ? "document" : "audio",
        url: `https://placeholder.silsila.app/media/${i + 1}.jpg`,
        caption: i < 14 ? `Portrait of ${person.fullName}` : i < 18 ? `Family record for ${person.fullName}` : `Oral history narrated by ${person.fullName}`,
        year: person.birthYear ? person.birthYear + 30 : undefined,
        uploadedBy: superAdmin.id,
      },
    });
  }
  console.log("   ✓ 20 media items created");

  // --- SOURCES ---
  console.log("📚 Creating sources...");
  const sourceTypes = ["oral", "oral", "oral", "document", "document", "nadra", "nadra", "book", "oral", "document", "oral", "document", "nadra", "book", "other"];
  const sourceTitles = [
    "Oral account from village elder",
    "Family recollection by grandson",
    "Community gathering testimony",
    "Hunza Historical Society document",
    "Birth certificate copy",
    "NADRA family registration",
    "NADRA CNIC record",
    "Hunza: A Lost Kingdom by J. Biddulph",
    "Elder interview at Baltit Fort event",
    "Village council registry",
    "Grandchild testimony",
    "Marriage certificate",
    "NADRA B-form",
    "The Making of Karakoram by H. Knight",
    "Community genealogy notes",
  ];
  for (let i = 0; i < 15; i++) {
    const person = personRecords[i * 12 % personRecords.length];
    await prisma.source.create({
      data: {
        title: sourceTitles[i],
        type: sourceTypes[i],
        personId: person.id,
        reliabilityScore: Math.min(5, Math.floor(Math.random() * 3) + 3),
        addedById: i % 3 === 0 ? superAdmin.id : i % 3 === 1 ? villageAdmin.id : contributor.id,
      },
    });
  }
  console.log("   ✓ 15 sources created");

  // --- CONTRIBUTIONS ---
  console.log("📝 Creating contributions...");
  for (let i = 0; i < 10; i++) {
    const person = personRecords[i * 15 % personRecords.length];
    await prisma.contribution.create({
      data: {
        submittedBy: contributor.id,
        entityType: "person",
        entityId: person.id,
        personId: person.id,
        action: i < 6 ? "update" : "create",
        changeData: JSON.stringify({
          field: i < 6 ? "bio" : "fullName",
          oldValue: i < 6 ? null : undefined,
          newValue: i < 6 ? `Updated biographical info for ${person.fullName}` : `New person record submitted`,
        }),
        status: i < 4 ? "pending" : i < 7 ? "approved" : "rejected",
        reviewedBy: i >= 4 ? villageAdmin.id : undefined,
        reviewNotes: i >= 7 ? "Duplicate record, already exists in system" : undefined,
        reviewedAt: i >= 4 ? new Date() : undefined,
      },
    });
  }
  console.log("   ✓ 10 contributions created");

  // --- SUMMARY ---
  const counts = {
    villages: await prisma.village.count(),
    clans: await prisma.clan.count(),
    persons: await prisma.person.count(),
    relationships: await prisma.relationship.count(),
    users: await prisma.user.count(),
    mediaItems: await prisma.mediaItem.count(),
    sources: await prisma.source.count(),
    contributions: await prisma.contribution.count(),
  };

  console.log("\n✅ Seed complete!");
  console.log("─".repeat(40));
  console.log(`   Villages:      ${counts.villages}`);
  console.log(`   Clans:         ${counts.clans}`);
  console.log(`   Persons:       ${counts.persons}`);
  console.log(`   Relationships: ${counts.relationships}`);
  console.log(`   Users:         ${counts.users}`);
  console.log(`   Media Items:   ${counts.mediaItems}`);
  console.log(`   Sources:       ${counts.sources}`);
  console.log(`   Contributions: ${counts.contributions}`);
  console.log("─".repeat(40));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
