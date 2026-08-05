import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/core/models/user.model.js";
import { hashPassword } from "../src/core/utils/password.js";

const owner_Data = [
  {
    email: "plexivia@gmail.com",
    name: "Plexivia Dev",
    password: "11223345",
    phone: "+8801710000001",
    role: "Owner",
  },
  {
    email: "ikramul.web@gmail.com",
    name: "Ikramul Web",
    password: "111223344",
    phone: "+8801700000000",
    role: "Owner",
  },
];

const createOwners = async () => {
  await connectDatabase();
  try {
    for (const entry of owner_Data) {
      const { email, name, password, role, phone } = entry;
      if (!email || !name || !password) {
        console.warn(`Skipping entry, missing required fields: ${JSON.stringify(entry)}`);
        continue;
      }

      try {
        const passwordHash = await hashPassword(password);
        const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
          existing.role = role || existing.role;
          existing.passwordHash = passwordHash;
          existing.isActive = true;
          existing.phone = phone || existing.phone;
          await existing.save();
          console.log(`✅ Updated existing user ${email} (role=${existing.role}).`);
          continue;
        }

        const user = await UserModel.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role || 'Owner',
          phone: phone || '',
          isActive: true,
        });

        console.log(`✅ Owner created: ${user.email} (id=${user.id})`);
      } catch (innerErr) {
        console.error(`❌ Failed for ${entry.email}:`, innerErr.message || innerErr);
      }
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
};

createOwners();
