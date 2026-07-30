import mongoose from 'mongoose';
import { buildOrderNumber, validateOrderPayload } from '../helper/orderHelper.js';
import { OrderModel } from '../models/order.model.js';
import { MemberModel } from '../models/member.model.js';

const { Types } = mongoose;

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

    const orderData = {
      orderNumber: await buildOrderNumber(payload.orderType === 'instore'),
      status: 'received',
      createdBy: payload.createdBy?.trim() || '',
      updatedBy: '',
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

    if (orderData.member) {
      const memberUpdates = { $addToSet: { orders: createdOrder._id } };
      if (payload.billingInfo && typeof payload.billingInfo === 'object') {
        memberUpdates.$set = { ...(memberUpdates.$set || {}), billingInfo: payload.billingInfo };
      }
      if (payload.shippingInfo && typeof payload.shippingInfo === 'object') {
        memberUpdates.$set = { ...(memberUpdates.$set || {}), shippingInfo: payload.shippingInfo };
      }
      await MemberModel.findByIdAndUpdate(orderData.member, memberUpdates, { new: true, runValidators: true });
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
    if (payload.updatedBy !== undefined) {
      allowedUpdates.updatedBy = payload.updatedBy?.trim() || '';
    }

    const order = await OrderModel.findByIdAndUpdate(orderId, allowedUpdates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    return res.json({ status: 'success', data: order });
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

    return res.json({ status: 'success', message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
