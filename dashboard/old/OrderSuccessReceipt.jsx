import React from 'react';
import {
  CheckCircle,
  Printer,
  Download,
} from 'lucide-react';

/**
 * Renders the order success receipt screen shown after a direct sale is confirmed.
 */
export const OrderSuccessReceipt = ({ successOrder, onBack, onPrint, onDownload }) => {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500/10 border-b border-slate-100 p-8 text-center flex flex-col items-center">
          <div className="h-14 w-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Direct Sale Recorded</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">{successOrder.orderNumber}</p>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Customer</span>
              <span className="text-slate-800 font-bold block mt-0.5">{successOrder.customerName}</span>
              <span className="text-slate-500 block font-mono text-[10px] mt-0.5">{successOrder.customerEmail}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Payment</span>
              <span className="text-slate-800 font-bold block mt-0.5">{successOrder.paymentMethod}</span>
              <span className="text-emerald-600 block font-semibold text-[10px] mt-0.5">● Paid Directly</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px] mb-3">Items Purchased</span>
            <div className="divide-y divide-slate-50">
              {successOrder.items.map((item) => (
                <div key={item.productId} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Qty: {item.quantity} @ ৳{Number(item.price || 0).toFixed(2)} each
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-950">
                    ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200/60 pt-5 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">Total Amount Charged</span>
            <span className="text-lg font-mono font-black text-slate-950">৳{Number(successOrder.total || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onPrint(successOrder)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
          >
            <Printer className="h-4 w-4 text-slate-400" />
            Print Paper Receipt
          </button>
          <button
            onClick={() => onDownload(successOrder)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
          >
            <Download className="h-4 w-4" />
            Download Invoice (HTML)
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-950 cursor-pointer underline transition"
        >
          Back to Orders Dashboard
        </button>
      </div>
    </div>
  );
};
