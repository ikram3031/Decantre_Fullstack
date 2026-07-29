import { UserModel, USER_ROLES } from "../models/user.model.js";
import { AssetModel } from "../models/asset.model.js";
import { hashPassword } from "../utils/password.js";

const validateCreateUserPayload = (payload) => {
  const errors = [];

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    errors.push("name is required");
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email is required");
  }

  if (!payload.phone || typeof payload.phone !== "string" || !payload.phone.trim()) {
    errors.push("phone is required");
  }

  if (!payload.password || typeof payload.password !== "string" || payload.password.length < 6) {
    errors.push("password is required and must be at least 6 characters");
  }

  if (!payload.role || !USER_ROLES.includes(payload.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  // If role is Employee, require assets (1-2)
  if (payload.role === "Employee") {
    if (!Array.isArray(payload.assets) || payload.assets.length === 0) {
      errors.push("Employee must be assigned at least one asset");
    } else if (payload.assets.length > 2) {
      errors.push("An employee may have at most 2 assets assigned");
    }
  }

  return errors;
};

const validateUpdateUserPayload = (payload) => {
  const errors = [];

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    errors.push("name is required");
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email is required");
  }

  if (!payload.phone || typeof payload.phone !== "string" || !payload.phone.trim()) {
    errors.push("phone is required");
  }

  if (payload.role && !USER_ROLES.includes(payload.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  if (payload.password && payload.password.length < 6) {
    errors.push("password must be at least 6 characters when provided");
  }

  if (payload.role === "Employee") {
    if (!Array.isArray(payload.assets) || payload.assets.length === 0) {
      errors.push("Employee must be assigned at least one asset");
    } else if (payload.assets.length > 2) {
      errors.push("An employee may have at most 2 assets assigned");
    }
  }

  return errors;
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find().lean();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).lean();
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateCreateUserPayload(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    // If creator is Admin, they cannot create Owner or Admin accounts
    const creatorRole = req.user?.role || null;
    if (creatorRole === "Admin" && (payload.role === "Owner" || payload.role === "Admin")) {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to create this role" });
    }

    const existing = await UserModel.findOne({ email: payload.email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists" });
    }

    // If Employee, validate assets exist
    let assignedAssets = [];
    if (payload.role === "Employee") {
      assignedAssets = Array.isArray(payload.assets) ? payload.assets : [];
      const found = await AssetModel.find({ did: { $in: assignedAssets } }).lean();
      if (found.length !== assignedAssets.length) {
        return res.status(400).json({ status: "error", message: "One or more assigned assets not found" });
      }
    }

    const user = await UserModel.create({
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone.trim(),
      role: payload.role,
      passwordHash: await hashPassword(payload.password),
      assets: assignedAssets,
    });

    res.status(201).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const payload = req.body ?? {};
    const validationErrors = validateUpdateUserPayload(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    // If updater is Admin, prevent modifying Owner accounts
    const updaterRole = req.user?.role || null;
    if (updaterRole === "Admin" && user.role === "Owner") {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to modify this user" });
    }

    if (payload.email && payload.email.toLowerCase().trim() !== user.email) {
      const emailExists = await UserModel.findOne({ email: payload.email.toLowerCase().trim() });
      if (emailExists) return res.status(409).json({ status: "error", message: "A user with this email already exists" });
    }

    user.name = payload.name.trim();
    user.email = payload.email.toLowerCase().trim();
    user.phone = payload.phone.trim();
    user.role = payload.role || user.role;
    user.isActive = payload.isActive !== undefined ? Boolean(payload.isActive) : user.isActive;

    if (payload.password) {
      user.passwordHash = await hashPassword(payload.password);
    }

    if (payload.role === "Employee" && payload.assets) {
      const assignedAssets = Array.isArray(payload.assets) ? payload.assets : [];
      if (assignedAssets.length > 2) {
        return res.status(400).json({ status: "error", message: "An employee may have at most 2 assets assigned" });
      }
      const found = await AssetModel.find({ did: { $in: assignedAssets } }).lean();
      if (found.length !== assignedAssets.length) {
        return res.status(400).json({ status: "error", message: "One or more assigned assets not found" });
      }
      user.assets = assignedAssets;
    }

    await user.save();

    res.json({ status: "success", data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;

    const user = await UserModel.findById(userId).lean();
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    // Admin cannot delete their own account
    if (requesterRole === "Admin" && requesterId === String(user._id)) {
      return res.status(403).json({ status: "error", message: "Admin cannot delete own account" });
    }

    // Admin cannot delete Owner
    if (requesterRole === "Admin" && user.role === "Owner") {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to delete this user" });
    }

    await UserModel.findByIdAndDelete(userId);
    res.json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
