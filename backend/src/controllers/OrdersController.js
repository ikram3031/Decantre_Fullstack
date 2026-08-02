import mongoose from 'mongoose';
import { buildOrderNumber, validateOrderPayload } from '../helper/orderHelper.js';
import { OrderModel } from '../models/order.model.js';
import { MemberModel } from '../models/member.model.js';
import { PaymentModel } from '../models/payment.model.js';
import { UserModel } from '../models/user.model.js';

const { Types } = mongoose;

const isPaidPaymentMethod = (paymentMethod) => {
  const method = (paymentMethod || "").toString().trim().toLowerCase();
  if (!method) return false;
  if (method === "cod" || method.includes("cash") || method.includes("full") || method === "paid") {
    return true;
  }
  return false;
};

const computeMemberTotals = async (memberId) => {
  const orders = await OrderModel.find({ member: memberId }).select('paymentMethod totals.total').lean();
  let totalOrderAmount = 0;
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;

  for (const order of orders) {
    const amount = Number(order?.totals?.total || 0);
    totalOrderAmount += amount;
    if (isPaidPaymentMethod(order.paymentMethod)) {
      totalPaidAmount += amount;
    } else {
      totalPendingAmount += amount;
    }
  }

  return { totalOrderAmount, totalPaidAmount, totalPendingAmount };
};

const updateMemberTotals = async (memberId) => {
  if (!memberId) return;
  const totals = await computeMemberTotals(memberId);
  await MemberModel.findByIdAndUpdate(memberId, totals, { new: true, runValidators: true });
};

const updateMemberOrderReference = async (memberId, orderDid, orderValue) => {
  if (!memberId) return;
  await MemberModel.updateOne(
    { _id: memberId },
    {
      $pull: { orders: { did: orderDid } },
      $addToSet: { orders: { did: orderDid, value: orderValue } },
    },
  );
};

const getPaymentStatus = (paymentMethod, totalAmount, paidAmount) => {
  const method = (paymentMethod || "").toString().trim().toLowerCase();
  if (!method) return "pending";
  if (method === "cod" || method.includes("cash") || method.includes("full") || method === "paid") {
    if (paidAmount >= totalAmount) return "paid";
    if (paidAmount > 0) return "partial";
    return "pending";
  }
  return paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "pending";
};

const syncOrderPayment = async (orderData) => {
  const totalAmount = Number(orderData.totals?.total || 0);
  const paidAmount = isPaidPaymentMethod(orderData.paymentMethod) ? totalAmount : 0;
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatus = getPaymentStatus(orderData.paymentMethod, totalAmount, paidAmount);

  await PaymentModel.findOneAndUpdate(
    { orderId: orderData._id },
    {
      paymentMethod: orderData.paymentMethod,
      paymentPhone: orderData.customer?.phone || "",
      totalAmount,
      paidAmount,
      pendingAmount,
      amount: paidAmount,
      paymentStatus,
      createdBy: orderData.createdBy || null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const createOrder = async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateOrderPayload(payload);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order payload',
        errors: validationErrors,
      });
    }

    let createdByUserId = null;
    const rawCreatedBy = payload.createdBy?.trim();
    if (rawCreatedBy) {
      if (Types.ObjectId.isValid(rawCreatedBy)) {
        createdByUserId = rawCreatedBy;
      } else {
        const foundUser = await UserModel.findOne({ did: rawCreatedBy }).select('_id').lean();
        if (foundUser) {
          createdByUserId = foundUser._id;
        }
      }
    }

    const orderData = {
      orderNumber: await buildOrderNumber(payload.orderType === 'instore'),
      status: 'received',
      createdBy: createdByUserId,
      updatedBy: null,
      member: payload.memberId && Types.ObjectId.isValid(payload.memberId) ? payload.memberId : undefined,
      customer: {
        fullName: payload.fullName?.trim() || '',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        address: payload.address?.trim() || '',
        city: payload.city?.trim() || '',
        thana: payload.thana?.trim() || '',
        district: payload.district?.trim() || '',
        zip: payload.zip?.trim() || '',
        giftWrap: Boolean(payload.giftWrap),
      },
      paymentMethod: payload.paymentMethod.trim(),
      shippingAddress: payload.shippingAddress ?? {},
      items: (payload.items || []).map((item) => ({
        name: item.name ?? 'Unknown product',
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        size: item.size ?? '',
        concentration: item.concentration ?? '',
      })),
      totals: {
        subtotal: Number(payload.subtotal || 0),
        shippingFee: Number(payload.shippingFee || 0),
        tax: Number(payload.tax || 0),
        total: Number(payload.total || 0),
      },
    };

    const createdOrder = await OrderModel.create(orderData);
    await syncOrderPayment(createdOrder);

    if (orderData.member) {
      const orderValue = createdOrder.totals?.total ?? 0;
      const memberUpdates = { $addToSet: { orders: { did: createdOrder.did, value: orderValue } } };
      if (payload.billingInfo && typeof payload.billingInfo === 'object') {
        memberUpdates.$set = { ...(memberUpdates.$set || {}), billingInfo: payload.billingInfo };
      }
      if (payload.shippingInfo && typeof payload.shippingInfo === 'object') {
        memberUpdates.$set = { ...(memberUpdates.$set || {}), shippingInfo: payload.shippingInfo };
      }
      await MemberModel.findByIdAndUpdate(orderData.member, memberUpdates, { new: true, runValidators: true });
      await updateMemberTotals(orderData.member);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Order received successfully',
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.email) {
      filter['customer.email'] = req.query.email.toLowerCase().trim();
    }

    const total = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      status: 'success',
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid order ID' });
    }

    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    return res.json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid order ID' });
    }

    const payload = req.body ?? {};
    const existingOrder = await OrderModel.findById(orderId).lean();
    if (!existingOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const affectedMemberIds = new Set();
    if (existingOrder.member) {
      affectedMemberIds.add(existingOrder.member.toString());
    }

    const allowedUpdates = {};

    if (payload.status) {
      allowedUpdates.status = payload.status;
    }
    if (payload.shippingAddress) {
      allowedUpdates.shippingAddress = payload.shippingAddress;
    }
    if (payload.paymentMethod) {
      allowedUpdates.paymentMethod = payload.paymentMethod;
    }
    if (payload.totals) {
      allowedUpdates.totals = payload.totals;
    }
    if (payload.discountTotalAmount !== undefined) {
      allowedUpdates.discountTotalAmount = Number(payload.discountTotalAmount || 0);
    }
    if (payload.shippingTotalAmount !== undefined) {
      allowedUpdates.shippingTotalAmount = Number(payload.shippingTotalAmount || 0);
    }
    if (payload.customer) {
      allowedUpdates.customer = {
        fullName: payload.customer.fullName?.trim() || existingOrder.customer?.fullName || '',
        phone: payload.customer.phone?.trim() || existingOrder.customer?.phone || '',
        email: payload.customer.email?.trim() || existingOrder.customer?.email || '',
        address: payload.customer.address?.trim() || existingOrder.customer?.address || '',
        city: payload.customer.city?.trim() || existingOrder.customer?.city || '',
        thana: payload.customer.thana?.trim() || existingOrder.customer?.thana || '',
        district: payload.customer.district?.trim() || existingOrder.customer?.district || '',
        zip: payload.customer.zip?.trim() || existingOrder.customer?.zip || '',
        giftWrap: payload.customer.giftWrap !== undefined ? Boolean(payload.customer.giftWrap) : existingOrder.customer?.giftWrap,
      };
    }
    if (payload.items) {
      allowedUpdates.items = (payload.items || []).map((item) => ({
        name: item.name ?? 'Unknown product',
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        size: item.size ?? '',
        concentration: item.concentration ?? '',
        productDid: item.productDid ?? '',
      }));
    }
    if (payload.memberId !== undefined) {
      if (payload.memberId && Types.ObjectId.isValid(payload.memberId)) {
        allowedUpdates.member = payload.memberId;
        affectedMemberIds.add(payload.memberId);
      } else if (payload.memberId === null) {
        allowedUpdates.member = undefined;
      }
    }
    if (payload.updatedBy !== undefined) {
      let updatedByUserId = null;
      const rawUpdatedBy = payload.updatedBy?.trim();
      if (rawUpdatedBy) {
        if (Types.ObjectId.isValid(rawUpdatedBy)) {
          updatedByUserId = rawUpdatedBy;
        } else {
          const foundUser = await UserModel.findOne({ did: rawUpdatedBy }).select('_id').lean();
          if (foundUser) {
            updatedByUserId = foundUser._id;
          }
        }
      }
      allowedUpdates.updatedBy = updatedByUserId;
    }

    const order = await OrderModel.findByIdAndUpdate(orderId, allowedUpdates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    const oldMemberId = existingOrder.member ? existingOrder.member.toString() : null;
    const newMemberId = order.member ? order.member.toString() : null;
    const orderDid = order.did;
    const orderValue = Number(order.totals?.total || 0);

    if (oldMemberId && oldMemberId !== newMemberId) {
      await MemberModel.updateOne(
        { _id: oldMemberId },
        { $pull: { orders: { did: orderDid } } },
      );
    }

    if (newMemberId) {
      await updateMemberOrderReference(newMemberId, orderDid, orderValue);
    }

    await syncOrderPayment(order);

    if (oldMemberId) affectedMemberIds.add(oldMemberId);
    if (newMemberId) affectedMemberIds.add(newMemberId);

    for (const memberId of affectedMemberIds) {
      await updateMemberTotals(memberId);
    }

    return res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid order ID' });
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(orderId).lean();
    if (!deletedOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    if (deletedOrder.member) {
      await MemberModel.updateOne(
        { _id: deletedOrder.member },
        { $pull: { orders: { did: deletedOrder.did } } },
      );
      await updateMemberTotals(deletedOrder.member);
    }

    await PaymentModel.findOneAndDelete({ orderId: deletedOrder._id });

    return res.json({ status: 'success', message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
