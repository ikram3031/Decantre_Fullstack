import "dotenv/config";
import mongoose from "mongoose";
import { BrandModel } from "../src/models/brand.model.js";
import { generateDid } from "../src/utils/generateDid.js";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME || "perfume-store";
if (!mongodbUri) throw new Error("MONGODB_URI must be defined in .env");

const brandGroups = [
  {
    id: "niche",
    name: "Niche",
    children: [
      "Amouage", "Atelier des Ors", "BDK Parfums", "Byredo", "Creed", "Diptyque",
      "Essential Parfums", "Frederic Malle", "Giardini Di Toscana", "Gisada",
      "INITIO PARFUMS PRIVÉS", "Kajal", "Kayali", "Loewe", "Maison Crivelli",
      "Maison Francis Kurkdjian", "Maison Martin Margiela", "Mancera", "Matiere Premier",
      "Montale", "Nishane", "Orto Parisi", "Parfums de Marly", "Penhaligon's",
      "Roja", "Roja Parfums", "Serge Lutens", "Sospiro", "Unique'e Luxury",
      "Van Cleef & Arpels", "Xerjoff"
    ],
  },
  {
    id: "designer",
    name: "Designer Brands",
    children: [
      "Ariana Grande", "Azzaro", "Bentley", "Billie Eilish", "Bottega Veneta",
      "Burberry", "Bvlgaris", "Cartier", "Calvin Klein", "Carolina Herrera",
      "Chanel", "Chloe", "Coach", "Davidoff", "Dior", "Dolce & Gabbana",
      "Dunhill", "Elie Saab", "Elizabeth Arden", "Giorgio Armani", "Givenchy",
      "Gucci", "Guerlain", "Hermes", "Hugo Boss", "Issey Miyake",
      "Jean Paul Gaultier", "Jimmy Choo", "Kenzo", "Kilian", "Lancôme",
      "Lacoste", "Louis Vuitton", "Mercedes Benz", "Marc Jacobs", "Montblanc",
      "Moschino", "Mugler", "Narciso Rodriguez", "Nautica", "Office for men (fragrance only)",
      "Paco Rabanne", "Prada", "Ralph Lauren", "Sabrina Carpenter", "Tom Ford",
      "Valentino", "Versace", "Victoria's Secret", "Viktor & Rolf", "Yves Saint Laurent",
      "Zara"
    ],
  },
  {
    id: "arabian",
    name: "UAE & Arabian Brands",
    children: [
      "Armaf", "Afnan", "Ahmad Al Maghribi", "Al Haramain", "Brandy",
      "French Avenue", "Khadlaj", "Maison Alhambra", "Maison Asrar", "Naseem",
      "Lattafa", "Paris Corner", "Rasasi", "Rayhaan", "Reyane Tradition",
      "Swiss Arabian"
    ],
  },
];

function slugify(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("\n🔧 Connecting to MongoDB...");
  await mongoose.connect(mongodbUri, { dbName: mongodbDbName });

  try {
    console.log("🧹 Clearing existing Brand documents...");
    await BrandModel.deleteMany({});

    const parentDocs = await BrandModel.insertMany(
      brandGroups.map((group) => ({
        name: group.name,
        slug: slugify(group.id),
        did: generateDid(),
        description: "",
        imageUrl: "",
        productCount: 0,
        parent: null,
      })),
      { ordered: true }
    );

    const parentMap = new Map(parentDocs.map((doc) => [doc.name, doc._id]));

    const childDocs = [];
    for (const group of brandGroups) {
      const parentId = parentMap.get(group.name);
      for (const childName of group.children) {
        childDocs.push({
          name: childName,
          slug: slugify(childName),
          did: generateDid(),
          description: "",
          imageUrl: "",
          productCount: 0,
          parent: parentId,
        });
      }
    }

    console.log(`📦 Inserting ${childDocs.length} sub-brands...`);
    await BrandModel.insertMany(childDocs, { ordered: false });

    console.log("✅ Brand reset and import complete.");
  } catch (err) {
    console.error("❌ Failed to reset and import brands:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

main();
