import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { MemberModel } from "../src/models/member.model.js";

const startDate = new Date(Date.UTC(2026, 6, 31, 0, 0, 0));
const endDate = new Date(Date.UTC(2026, 6, 31, 23, 59, 59, 999));

async function run() {
  await connectDatabase();
  try {
    console.log(
      `Updating members created between ${startDate.toISOString()} and ${endDate.toISOString()}...`,
    );

    const result = await MemberModel.updateMany(
      { createdAt: { $gte: startDate, $lte: endDate } },
      { $set: { verified: false } },
    );

    console.log(`✅ Matched ${result.matchedCount} member(s), updated ${result.modifiedCount} member(s).`);
  } catch (error) {
    console.error("❌ Failed to update members:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

void run();
