import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { createCreditCardCharge } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

// ประกาศ type สำหรับ window.Omise
declare global {
  interface Window {
    Omise: any;
    OmiseCard: any;
  }
}

interface OmiseCheckoutProps {
  amount: number;
  courseIds: string[];
  userId: string;
  email: string;
  name: string;
  onSuccess: () => void;
  onError: (error: any) => void;
}

const OmiseCheckout: React.FC<OmiseCheckoutProps> = ({
  amount,
  courseIds,
  userId,
  email,
  name,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // โหลด Omise.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.omise.co/omise.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = () => {
    setIsLoading(true);
    setError(null);

    // ตรวจสอบว่า Omise ถูกโหลดแล้วหรือไม่
    if (!window.Omise) {
      setError('ไม่สามารถโหลด Omise.js ได้ กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
      return;
    }

    // กำหนดค่า public key
    window.Omise.setPublicKey('pkey_test_63m561eoqvnrlc387uk');

    // สร้าง OmiseCard
    window.OmiseCard = window.OmiseCard || {};
    window.OmiseCard.configure({
      publicKey: 'pkey_test_63m561eoqvnrlc387uk',
      currency: 'thb',
      frameLabel: 'JubeTech',
      submitLabel: 'ชำระเงิน',
      buttonLabel: 'ชำระเงินด้วยบัตรเครดิต/เดบิต',
    });

    // กำหนดค่าสำหรับฟอร์มชำระเงิน
    window.OmiseCard.configure({
      defaultPaymentMethod: 'credit_card',
      otherPaymentMethods: []
    });

    window.OmiseCard.open({
      amount: amount * 100, // แปลงเป็นสตางค์ (บาท * 100)
      onCreateTokenSuccess: async (token: string) => {
        try {
          // ส่งข้อมูลไปยัง API เพื่อสร้าง charge
          const result = await createCreditCardCharge(
            token,
            amount,
            courseIds,
            userId,
            email,
            name
          );

          setIsLoading(false);
          
          if (result.success) {
            // ลบข้อมูลตะกร้าสินค้าหลังจากชำระเงินสำเร็จ
            localStorage.removeItem('cartItems');
            
            // แจ้งเตือนการชำระเงินสำเร็จ
            onSuccess();
            
            // นำทางไปยังหน้าคอร์สของฉัน
            setTimeout(() => {
              navigate('/my-courses');
            }, 2000);
          } else {
            setError(result.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
            onError(result.message);
          }
        } catch (error: any) {
          setIsLoading(false);
          setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
          onError(error);
        }
      },
      onFormClosed: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        className="checkout-btn"
        disabled={isLoading}
        onClick={handleCheckout}
        sx={{
          backgroundColor: "#a906f5",
          '&:hover': {
            backgroundColor: "#8205c0",
          },
          '&.Mui-disabled': {
            backgroundColor: "#e0e0e0",
            color: "#a0a0a0"
          }
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ชำระเงิน'}
      </Button>

      <Dialog open={!!error} onClose={() => setError(null)}>
        <DialogTitle>เกิดข้อผิดพลาด</DialogTitle>
        <DialogContent>
          <Typography>{error}</Typography>
          <Button 
            onClick={() => setError(null)} 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            ตกลง
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OmiseCheckout;
