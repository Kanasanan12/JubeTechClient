import axios from 'axios';

// ฟังก์ชันสำหรับการชำระเงินด้วยบัตรเครดิตผ่าน Omise
export const createCreditCardCharge = async (
  token: string,
  amount: number,
  courseIds: string[],
  userId: string,
  email: string,
  name: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/payment/charge`,
      {
        token,
        amount,
        courseIds,
        userId,
        email,
        name
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')?.replace(/"/g, '')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ฟังก์ชันสำหรับการชำระเงินด้วย Internet Banking หรือ PromptPay
export const createCheckoutSession = async (
  amount: number,
  courseIds: string[],
  userId: string,
  email: string,
  name: string,
  paymentMethod: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/payment/checkout-session`,
      {
        amount,
        courseIds,
        userId,
        email,
        name,
        paymentMethod
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')?.replace(/"/g, '')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ฟังก์ชันสำหรับการตรวจสอบสถานะการชำระเงิน
export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/payment/status/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')?.replace(/"/g, '')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ฟังก์ชันสำหรับการดึงประวัติการชำระเงิน
export const getPaymentHistory = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/payment/history`,
      {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')?.replace(/"/g, '')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
