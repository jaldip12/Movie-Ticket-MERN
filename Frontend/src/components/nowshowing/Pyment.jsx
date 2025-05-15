import { useState } from 'react';

const Pyment = () => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add payment processing logic here
    console.log('Payment submitted:', paymentData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-blue-500 rounded-full flex flex-shrink-0 justify-center items-center text-white text-2xl font-mono">
                💳
              </div>
              <div className="block pl-2 font-semibold text-xl text-gray-700">
                <h2 className="leading-relaxed">Payment Details</h2>
              </div>
            </div>

            <form className="divide-y divide-gray-200" onSubmit={handleSubmit}>
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolder"
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                    placeholder="John Doe"
                    value={paymentData.cardHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <div className="flex-1">
                    <label className="leading-loose">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={paymentData.expiry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="leading-loose">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                      placeholder="123"
                      maxLength="3"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pyment;