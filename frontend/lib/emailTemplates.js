export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #e23235; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
    </div>
    
    <div style="padding: 24px;">
      <p style="color: #444; margin: 0 0 20px;">Hello,</p>
      <p style="color: #444; margin: 0 0 20px;">Thank you for signing up! Your verification code is:</p>
      
      <div style="text-align: center; margin: 24px 0; padding: 16px; background: #f8f8f8; border-radius: 4px;">
        <span style="font-size: 32px; letter-spacing: 4px; color: #e23235;">{verificationCode}</span>
      </div>

      <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Enter this code to complete your registration.</p>
      <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Code expires in 15 minutes.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #444; margin: 0;">Best regards,<br>Wheels Hub Team</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #e23235; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Successful</h1>
    </div>

    <div style="padding: 24px;">
      <p style="color: #444; margin: 0 0 20px;">Your password has been successfully reset.</p>
      
      <div style="background: #fff3f3; padding: 16px; border-radius: 4px; margin: 24px 0;">
        <p style="color: #e23235; margin: 0; font-size: 14px;">If you did not make this change, please contact support immediately.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #444; margin: 0;">Best regards,<br>Wheels Hub Team</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #e23235; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
    </div>

    <div style="padding: 24px;">
      <p style="color: #444; margin: 0 0 20px;">Click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="{resetLink}" style="display: inline-block; background: #e23235; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reset Password</a>
      </div>

      <p style="color: #666; margin: 0 0 8px; font-size: 14px;">This link expires in 1 hour.</p>
      
      <div style="background: #f8f8f8; padding: 16px; border-radius: 4px; margin: 24px 0;">
        <p style="color: #666; margin: 0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #444; margin: 0;">Best regards,<br>Wheels Hub Team</p>
    </div>
  </div>
</body>
</html>
`;

export const ORDER_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #e23235; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmation</h1>
    </div>

    <div style="padding: 24px;">
      <p style="color: #444; margin: 0 0 20px;">Thank you for your order!</p>

      <div style="background: #f8f8f8; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>Order ID:</strong> {orderId}</p>
        <p style="margin: 0 0 8px;"><strong>Total:</strong> {totalAmount}</p>
        <p style="margin: 0;"><strong>Payment:</strong> {paymentMethod}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="color: #444; font-size: 18px; margin: 0 0 16px;">Order Details</h2>
        {orderItems}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="{orderLink}" style="display: inline-block; background: #e23235; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Track Order</a>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #444; margin: 0;">Best regards,<br>Wheels Hub Team</p>
    </div>
  </div>
</body>
</html>
`;