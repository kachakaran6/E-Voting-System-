const bcrypt = require("bcryptjs");
const { User } = require("../models/User");

async function seedPredefinedUsers() {
  const superEmail = "superadmin@gmail.com";
  const adminEmail = "admin@gmail.com";

  const existingSuper = await User.findOne({ email: superEmail });
  if (!existingSuper) {
    await User.create({
      fullName: "Super Admin",
      email: superEmail,
      passwordHash: await bcrypt.hash("sadmin123", 12),
      role: "SUPER_ADMIN",
    });
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    });
  }
}

module.exports = { seedPredefinedUsers };

