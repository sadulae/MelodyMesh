import React, { useState } from 'react';
import './OrganizePayments.css'; // Assuming you have CSS styling here
import axios from 'axios'; // Import axios to handle HTTP requests

const OrganizePayments = () => {
  const [payments, setPayments] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({
    date: '',
    description: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
    setError(''); // Clear error on input change
  };

  const addPayment = () => {
    if (!paymentDetails.date || !paymentDetails.description || !paymentDetails.amount) {
      setError('All fields are required.');
      return;
    }
    if (paymentDetails.amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    setPayments([...payments, { ...paymentDetails }]);
    setPaymentDetails({ date: '', description: '', amount: '' }); // Clear form
  };

  const editPayment = (index) => {
    const selectedPayment = payments[index];
    setPaymentDetails(selectedPayment);
    deletePayment(index); // Remove the old entry to update
  };

  const deletePayment = (index) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  const saveAndSend = async () => {
    if (payments.length === 0) {
      setError('No payments to save. Add at least one payment.');
      return;
    }
    try {
      setIsSubmitting(true); // Disable button while submitting
      const response = await axios.post('http://localhost:5000/api/save-payment', { payments });
      if (response.status === 201) {
        alert('Saved & Sent to DB Successfully');
      } else {
        setError('Failed to save data.');
      }
    } catch (error) {
      console.error('Error saving payment data:', error);
      setError('Error saving payment data.');
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  const goBack = () => {
    window.location.href = 'http://localhost:3000/';
  };

  return (
    <div className="organize-payments-container">
      <h2>Add Payment for Band And Performers</h2>
      <div className="input-group">
        <input
          type="date"
          name="date"
          value={paymentDetails.date}
          onChange={handleInputChange}
          placeholder="Date"
        />
        <input
          type="text"
          name="description"
          value={paymentDetails.description}
          onChange={handleInputChange}
          placeholder="Description"
        />
        <input
          type="number"
          name="amount"
          value={paymentDetails.amount}
          onChange={handleInputChange}
          placeholder="Amount"
          min="1"
        />
        <button onClick={addPayment}>Add</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>CRUD</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index}>
              <td>{payment.date}</td>
              <td>{payment.description}</td>
              <td>{payment.amount}</td>
              <td>
                <button onClick={() => editPayment(index)}>✏️</button>
                <button onClick={() => deletePayment(index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-group">
        <button onClick={goBack}>Back</button>
        <button onClick={saveAndSend} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save & Send'}
        </button>
      </div>
    </div>
  );
};

export default OrganizePayments;
