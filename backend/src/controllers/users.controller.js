import { UserModel, USER_ROLES } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";

function validateCreateUserPayload(payload) {
  const errors = [];

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    errors.push("name is required");
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email is required");
  }

  if (!payload.password || typeof payload.password !== "string" || payload.password.length < 6) {
    errors.push("password is required and must be at least 6 characters");
  }

  if (!payload.role || !USER_ROLES.includes(payload.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  return errors;
}

function validateUpdateUserPayload(payload) {
  const errors = [];

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    errors.push("name is required");
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email is required");
  }

  if (payload.role && !USER_ROLES.includes(payload.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  if (payload.password && payload.password.length < 6) {
    errors.push("password must be at least 6 characters when provided");
  }

  return errors;
}

export async function listUsers(req, res, next) {
  try {
    const users = await UserModel.find().lean();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

function validateUserPayload(payload) {
  const errors = [];

  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
    errors.push("name is required");
  }

  if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
    errors.push("email is required");
  }

  if (!payload.role || !USER_ROLES.includes(payload.role)) {
    errors.push(`role must be one of: ${USER_ROLES.join(", ")}`);
  }

  return errors;
}

export async function createUser(req, res, next) {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateCreateUserPayload(payload);

    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    const existing = await UserModel.findOne({ email: payload.email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists" });
    }

    const user = await UserModel.create({
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      role: payload.role,
      passwordHash: await hashPassword(payload.password),
    });

    res.status(201).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { userId } = req.params;
    const payload = req.body ?? {};
    const validationErrors = validateUserPayload(payload);

    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (payload.email && payload.email.toLowerCase().trim() !== user.email) {
      const emailExists = await UserModel.findOne({ email: payload.email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(409).json({ status: "error", message: "A user with this email already exists" });
      }
    }

    user.name = payload.name.trim();
    user.email = payload.email.toLowerCase().trim();
    user.role = payload.role || user.role;
    user.isActive = payload.isActive !== undefined ? Boolean(payload.isActive) : user.isActive;

    if (payload.password) {
      user.passwordHash = await hashPassword(payload.password);
    }

    await user.save();

    res.json({ status: "success", data: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await UserModel.findByIdAndDelete(userId).lean();

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}
