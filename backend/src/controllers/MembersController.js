import mongoose from "mongoose";
import { MemberModel } from "../models/member.model.js";
import { hashPassword } from "../utils/password.js";

const { Types } = mongoose;

function validateAddressPayload(address, sectionName) {
  const errors = [];
  const requiredFields = [
    "firstName",
    "lastName",
    "address1",
    "district",
    "city",
    "state",
    "postcode",
    "country",
    "email",
    "phone",
  ];

  if (!address || typeof address !== "object") {
    errors.push(`${sectionName} is required`);
    return errors;
  }

  requiredFields.forEach((field) => {
    const value = address[field];
    if (!value || typeof value !== "string" || !value.trim()) {
      errors.push(`${sectionName}.${field} is required`);
    }
  });

  return errors;
}

function validateMemberPayload(payload, billingInfo, shippingInfo) {
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

  errors.push(...validateAddressPayload(billingInfo, "billingInfo"));
  errors.push(...validateAddressPayload(shippingInfo, "shippingInfo"));

  return errors;
}

function sanitizeInfo(info) {
  if (!info || typeof info !== "object") return {};
  return Object.entries(info).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = typeof value === "string" ? value.trim() : value;
    return acc;
  }, {});
}

export async function listMembers(req, res, next) {
  try {
    const members = await MemberModel.find().lean();
    res.json({ status: "success", data: members });
  } catch (error) {
    next(error);
  }
}

export async function getMemberById(req, res, next) {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ status: "error", message: "Invalid member ID" });
    }

    const member = await MemberModel.findById(memberId).populate("orders").lean();
    if (!member) {
      return res.status(404).json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", data: member });
  } catch (error) {
    next(error);
  }
}

export async function deleteMember(req, res, next) {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ status: "error", message: "Invalid member ID" });
    }

    const member = await MemberModel.findByIdAndDelete(memberId).lean();
    if (!member) {
      return res.status(404).json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", message: "Member deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function createMember(req, res, next) {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateMemberPayload(payload, payload.billingInfo, payload.shippingInfo);
    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid member payload", errors: validationErrors });
    }

    const existing = await MemberModel.findOne({ email: payload.email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A member with this email already exists" });
    }

    const member = await MemberModel.create({
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone.trim(),
      passwordHash: await hashPassword(payload.password),
      billingInfo: sanitizeInfo(payload.billingInfo),
      shippingInfo: sanitizeInfo(payload.shippingInfo),
    });

    res.status(201).json({ status: "success", data: member });
  } catch (error) {
    next(error);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ status: "error", message: "Invalid member ID" });
    }

    const payload = req.body ?? {};
    const updates = {};

    if (payload.name) {
      updates.name = payload.name.trim();
    }
    if (payload.email) {
      updates.email = payload.email.toLowerCase().trim();
    }
    if (payload.phone) {
      updates.phone = payload.phone.trim();
    }
    if (payload.password) {
      if (typeof payload.password !== "string" || payload.password.length < 6) {
        return res.status(400).json({ status: "error", message: "password must be at least 6 characters" });
      }
      updates.passwordHash = await hashPassword(payload.password);
    }
    if (payload.billingInfo) {
      const billingErrors = validateAddressPayload(payload.billingInfo, "billingInfo");
      if (billingErrors.length > 0) {
        return res.status(400).json({ status: "error", message: "Invalid billing information", errors: billingErrors });
      }
      updates.billingInfo = sanitizeInfo(payload.billingInfo);
    }
    if (payload.shippingInfo) {
      const shippingErrors = validateAddressPayload(payload.shippingInfo, "shippingInfo");
      if (shippingErrors.length > 0) {
        return res.status(400).json({ status: "error", message: "Invalid shipping information", errors: shippingErrors });
      }
      updates.shippingInfo = sanitizeInfo(payload.shippingInfo);
    }

    const member = await MemberModel.findByIdAndUpdate(memberId, updates, { new: true, runValidators: true }).lean();
    if (!member) {
      return res.status(404).json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", data: member });
  } catch (error) {
    next(error);
  }
}
