import { useState } from "react";
import { CreditCard } from "lucide-react";

const Pyment = () => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Real payment integration is added in a later phase (Razorpay).
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const fieldClass =
    "w-full h-11 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 transition-colors";

  return (
    <div className="min-h-screen bg-white py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white backdrop-blur-sm shadow-xl p-7 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <CreditCard className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Details
              </h2>
              <p className="text-xs text-slate-400">
                Demo form — real payment lands in the next phase.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-800">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-800">
                Card Holder Name
              </label>
              <input
                type="text"
                name="cardHolder"
                placeholder="John Doe"
                value={paymentData.cardHolder}
                onChange={handleInputChange}
                className={fieldClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-800">
                  Expiry
                </label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={paymentData.expiry}
                  onChange={handleInputChange}
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-800">
                  CVV
                </label>
                <input
                  type="password"
                  name="cvv"
                  placeholder="123"
                  maxLength="3"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  className={fieldClass}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Pay Now
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your card details are not stored. PCI-DSS compliant payment goes live with Razorpay.
        </p>
      </div>
    </div>
  );
};

export default Pyment;
