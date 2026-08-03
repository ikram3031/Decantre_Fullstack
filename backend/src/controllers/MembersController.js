import mongoose from "mongoose";
import { MemberModel } from "../models/member.model.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { sendOtpEmail } from "../utils/otpDelivery.js";

const { Types } = mongoose;

const hasAddressData = (address) => {
  if (!address || typeof address !== "object") return false;

  return Object.entries(address).some(([key, value]) => {
    if (key === "company" || key === "address2") return false;
    if (typeof value === "string") return value.trim() !== "";
    return value !== undefined && value !== null;
  });
};

const validateAddressPayload = (address, sectionName) => {
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
    return [];
  }

  if (!hasAddressData(address)) {
    return [];
  }

  requiredFields.forEach((field) => {
    const value = address[field];
    if (!value || typeof value !== "string" || !value.trim()) {
      errors.push(`${sectionName}.${field} is required`);
    }
  });

  return errors;
};

const validateMemberPayload = (payload, billingInfo, shippingInfo) => {
  const errors = [];
  if (
    !payload.name ||
    typeof payload.name !== "string" ||
    !payload.name.trim()
  ) {
    errors.push("name is required");
  }
  if (
    !payload.email ||
    typeof payload.email !== "string" ||
    !payload.email.trim()
  ) {
    errors.push("email is required");
  }
  if (
    !payload.phone ||
    typeof payload.phone !== "string" ||
    !payload.phone.trim()
  ) {
    errors.push("phone is required");
  }
  if (
    !payload.password ||
    typeof payload.password !== "string" ||
    payload.password.length < 6
  ) {
    errors.push("password is required and must be at least 6 characters");
  }

  if (payload.billingInfo !== undefined) {
    errors.push(...validateAddressPayload(billingInfo, "billingInfo"));
  }
  if (payload.shippingInfo !== undefined) {
    errors.push(...validateAddressPayload(shippingInfo, "shippingInfo"));
  }

  return errors;
};

const sanitizeInfo = (info) => {
  if (!info || typeof info !== "object") return {};
  return Object.entries(info).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    acc[key] = typeof value === "string" ? value.trim() : value;
    return acc;
  }, {});
};

// GET /members - returns the list of all members
export const listMembers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '15', 10));
    
    const filter = {};
    
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    if (req.query.segment && req.query.segment !== 'All') {
      filter.segment = req.query.segment;
    }
    
    const total = await MemberModel.countDocuments(filter);
    const members = await MemberModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    res.json({
      status: "success",
      data: members,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /members/:memberId - returns the details of a specific member
export const getMemberById = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid member ID" });
    }

    const member = await MemberModel.findById(memberId).lean();
    if (!member) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", data: member });
  } catch (error) {
    next(error);
  }
};

// DELETE /members/:memberId - deletes a member
export const deleteMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid member ID" });
    }

    const member = await MemberModel.findByIdAndDelete(memberId).lean();
    if (!member) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", message: "Member deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /members - creates a new member
export const createMember = async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateMemberPayload(
      payload,
      payload.billingInfo,
      payload.shippingInfo,
    );
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid member payload",
        errors: validationErrors,
      });
    }

    const existing = await MemberModel.findOne({
      email: payload.email.toLowerCase().trim(),
    });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "A member with this email already exists",
      });
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
};

// PUT /members/:memberId - updates a member's information
export const updateMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    if (!Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid member ID" });
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
        return res.status(400).json({
          status: "error",
          message: "password must be at least 6 characters",
        });
      }
      updates.passwordHash = await hashPassword(payload.password);
    }
    if (payload.billingInfo !== undefined) {
      const billingErrors = validateAddressPayload(
        payload.billingInfo,
        "billingInfo",
      );
      if (billingErrors.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid billing information",
          errors: billingErrors,
        });
      }
      updates.billingInfo = sanitizeInfo(payload.billingInfo);
    }
    if (payload.shippingInfo !== undefined) {
      const shippingErrors = validateAddressPayload(
        payload.shippingInfo,
        "shippingInfo",
      );
      if (shippingErrors.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid shipping information",
          errors: shippingErrors,
        });
      }
      updates.shippingInfo = sanitizeInfo(payload.shippingInfo);
    }

    const member = await MemberModel.findByIdAndUpdate(memberId, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!member) {
      return res
        .status(404)
        .json({ status: "error", message: "Member not found" });
    }

    res.json({ status: "success", data: member });
  } catch (error) {
    next(error);
  }
};

// POST /members/register - starts member registration and generates an OTP
export const registerMember = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body ?? {};

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";
    const trimmedPassword = typeof password === "string" ? password : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedRole = typeof role === "string" ? role.trim() : "";

    const errors = [];
    if (!trimmedName) {
      errors.push("name is required");
    }
    if (!trimmedEmail) {
      errors.push("email is required");
    }
    if (!trimmedPhone) {
      errors.push("phone is required");
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      errors.push("password is required and must be at least 6 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration payload",
        errors,
      });
    }

    const existingMember = await MemberModel.findOne({
      email: trimmedEmail,
    }).select("+emailOtp");
    if (existingMember) {
      return res.status(409).json({
        status: "error",
        message: "A member with this email already exists",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

    let member;
    try {
      member = await MemberModel.create({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        passwordHash: await hashPassword(trimmedPassword),
        role: trimmedRole || "Customer",
        emailOtp: otp,
        emailOtpExpiresAt: otpExpires,
        billingInfo: sanitizeInfo(req.body?.billingInfo),
        shippingInfo: sanitizeInfo(req.body?.shippingInfo),
      });

      const emailResult = await sendOtpEmail({
        toEmail: member.email,
        otp,
        name: member.name,
        type: "registration",
      });

      if (!emailResult.delivered) {
        if (member?.id) {
          await MemberModel.findByIdAndDelete(member.id);
        }
        logger.warn(
          { email: trimmedEmail, reason: emailResult.reason },
          "OTP delivery failed during registration",
        );
        return res.status(500).json({
          status: "error",
          message: emailResult.reason || "Failed to send OTP email",
        });
      }
    } catch (emailError) {
      if (member?.id) {
        await MemberModel.findByIdAndDelete(member.id);
      }
      logger.error(
        { error: emailError, email: trimmedEmail },
        "Failed to send OTP email during registration",
      );
      return res
        .status(500)
        .json({ status: "error", message: "Failed to send OTP email" });
    }

    console.log(`Generated registration OTP for ${trimmedEmail}: ${otp}`);

    return res.status(201).json({
      status: "success",
      message: "An OTP to verify your account has been sent to your email.",
      data: {
        id: member.id,
        email: member.email,
        expiresAt: otpExpires.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /members/verify-otp - verifies the OTP and completes email verification
export const verifyMemberOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body ?? {};
    const trimmedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";
    const trimmedOtp = typeof otp === "string" ? otp.trim() : "";

    if (!trimmedEmail || !trimmedOtp) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and otp are required" });
    }

    const member = await MemberModel.findOne({
      email: trimmedEmail,
      emailOtp: trimmedOtp,
    }).select("+passwordHash +emailOtp +emailOtpExpiresAt");
    if (
      !member ||
      !member.emailOtpExpiresAt ||
      member.emailOtpExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired OTP" });
    }

    member.emailOtp = undefined;
    member.emailOtpExpiresAt = undefined;
    member.isEmailVerified = true;
    member.verified = true;
    member.emailVerifiedAt = new Date();
    await member.save();

    res.json({
      status: "success",
      message: "Verified successfully",
      data: {
        user: {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /members/login - logs in a member and issues JWT/refresh tokens
export const loginMember = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

    const member = await MemberModel.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );
    if (!member) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    // If email is not verified, skip password check and send OTP for verification
    if (
      member.isEmailVerified === false ||
      member.isEmailVerified === null ||
      member.isEmailVerified === undefined
    ) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

      member.emailOtp = otp;
      member.emailOtpExpiresAt = otpExpires;
      await member.save();

      try {
        await sendOtpEmail({
          toEmail: member.email,
          otp,
          name: member.name,
          type: "registration",
        });
      } catch (emailError) {
        logger.error(
          { error: emailError, email: normalizedEmail },
          "Failed to send verification OTP email during unverified login attempt",
        );
        return res
          .status(500)
          .json({ status: "error", message: "Verification required, but failed to send OTP email" });
      }

      console.log(`Generated login verification OTP for unverified user ${normalizedEmail}: ${otp}`);

      return res.status(200).json({
        status: "success",
        requiresOtp: true,
        message: "Your email is not verified. A verification code has been sent to your email.",
        data: {
          email: member.email,
          expiresAt: otpExpires.toISOString(),
        },
      });
    }

    // Email verified — validate password
    if (!member.passwordHash) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(
      password,
      member.passwordHash,
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const refreshToken = crypto.randomBytes(48).toString("hex");
    const refreshTokenExpiresAt = new Date(
      Date.now() + (env.REFRESH_TOKEN_EXPIRES_MS || 7 * 24 * 60 * 60 * 1000),
    );
    member.refreshToken = refreshToken;
    member.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await member.save();

    const accessToken = jwt.sign(
      { userId: member.id, role: member.role, email: member.email },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN || "15m" },
    );

    res.json({
      status: "success",
      data: {
        user: {
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
        },
        accessToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /members/resend-otp - resends a new OTP
export const resendMemberOtp = async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    const trimmedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!trimmedEmail) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    const member = await MemberModel.findOne({ email: trimmedEmail }).select(
      "+emailOtp +emailOtpExpiresAt",
    );
    if (!member) {
      return res
        .status(404)
        .json({ status: "error", message: "No member found with this email" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

    member.emailOtp = otp;
    member.emailOtpExpiresAt = otpExpires;
    await member.save();

    try {
      await sendOtpEmail({
        toEmail: member.email,
        otp,
        name: member.name,
        type: "registration",
      });
    } catch (emailError) {
      logger.error(
        { error: emailError, email: trimmedEmail },
        "Failed to resend OTP email",
      );
      return res
        .status(500)
        .json({ status: "error", message: "Failed to send OTP email" });
    }

    console.log(`Resend OTP for ${trimmedEmail}: ${otp}`);

    res.json({
      status: "success",
      message: "A new OTP has been sent to your email.",
      data: {
        email: member.email,
        expiresAt: otpExpires.toISOString(),
        otp: otp, // For testing purposes; remove in production
        otpExpiresAt: otpExpires.toISOString(), // For testing purposes; remove in production
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /members/forgot-password - sends a password reset OTP to the member's email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    const trimmedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!trimmedEmail) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    const member = await MemberModel.findOne({ email: trimmedEmail }).select(
      "+emailOtp +emailOtpExpiresAt",
    );
    if (!member) {
      // Don't reveal whether the email exists — security best practice
      return res.json({
        status: "success",
        message:
          "If an account with this email exists, a password reset OTP has been sent.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

    member.emailOtp = otp;
    member.emailOtpExpiresAt = otpExpires;
    await member.save();

    try {
      await sendOtpEmail({
        toEmail: member.email,
        otp,
        name: member.name,
        type: "forgot-password",
      });
    } catch (emailError) {
      logger.error(
        { error: emailError, email: trimmedEmail },
        "Failed to send password reset OTP email",
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to send password reset email",
      });
    }

    console.log(`Generated forgot-password OTP for ${trimmedEmail}: ${otp}`);

    return res.json({
      status: "success",
      message:
        "If an account with this email exists, a password reset OTP has been sent.",
      data: {
        email: member.email,
        expiresAt: otpExpires.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /members/reset-password - verifies OTP and sets a new password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body ?? {};
    const trimmedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";
    const trimmedOtp = typeof otp === "string" ? otp.trim() : "";
    const trimmedPassword = typeof password === "string" ? password : "";

    if (!trimmedEmail || !trimmedOtp || !trimmedPassword) {
      return res.status(400).json({
        status: "error",
        message: "Email, otp, and new password are required",
      });
    }
    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters",
      });
    }

    const member = await MemberModel.findOne({
      email: trimmedEmail,
      emailOtp: trimmedOtp,
    }).select("+emailOtp +emailOtpExpiresAt +passwordHash");
    if (
      !member ||
      !member.emailOtpExpiresAt ||
      member.emailOtpExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired OTP" });
    }

    member.passwordHash = await hashPassword(trimmedPassword);
    member.emailOtp = undefined;
    member.emailOtpExpiresAt = undefined;
    await member.save();

    return res.json({
      status: "success",
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
