import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/models/user.model.js";
import { hashPassword } from "../src/utils/password.js";

const email = "ikramul.web@gmail.com";
const name = "Developer";
const password = "111223344";
const role = "Super_Admin";

const createSuperAdmin = async () => {
  try {
    await connectDatabase();

    const passwordHash = await hashPassword(password);
    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      existing.role = role;
      existing.passwordHash = passwordHash;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Updated existing user ${email} password and role to ${role}.`);
      return;
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      isActive: true,
    });

    console.log("✅ Super admin created successfully:");
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Failed to create super admin:", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
};

createSuperAdmin();
