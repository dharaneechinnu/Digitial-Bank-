/**
 * Email Templates - Bank Grade Professional Templates
 * Contains all email templates for different notification types
 */

class EmailTemplates {
  
  /**
   * User Registration Welcome Email
   * @param {Object} data - Template data
   * @param {String} data.full_name - User's full name
   * @param {String} data.email - User's email
   * @returns {Object} - { subject, body }
   */
  static userRegistration(data) {
    const subject = 'Welcome to FinTech Bank - Account Created Successfully';
    
    const body = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Welcome to FinTech Bank</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #2c5aa0; }
              .content { margin: 20px 0; }
              .highlight-box { background-color: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 15px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
              .warning { color: #d63384; font-weight: bold; }
              .next-steps { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🏦 FinTech Bank</div>
                  <p style="margin: 10px 0 0 0; color: #666;">Your Trusted Digital Banking Partner</p>
              </div>
              
              <div class="content">
                  <h2 style="color: #2c5aa0;">Welcome ${data.full_name}!</h2>
                  
                  <p>Congratulations! Your FinTech Bank account has been created successfully.</p>
                  
                  <div class="highlight-box">
                      <strong>Account Details:</strong><br>
                      Email: ${data.email}<br>
                      Registration Date: ${new Date().toLocaleDateString('en-IN')}<br>
                      Status: KYC Verification Pending
                  </div>
                  
                  <div class="next-steps">
                      <h3 style="margin-top: 0; color: #2c5aa0;">📋 Next Steps:</h3>
                      <ol>
                          <li><strong>Complete KYC Verification</strong> - Submit your identity documents</li>
                          <li><strong>Account Activation</strong> - Your account will be activated after KYC approval</li>
                          <li><strong>Start Banking</strong> - Access all banking services once activated</li>
                      </ol>
                  </div>
                  
                  <div class="warning">
                      ⚠️ Important: Your account is currently INACTIVE until KYC verification is completed.
                  </div>
                  
                  <p>If you have any questions, our customer support team is available 24/7.</p>
              </div>
              
              <div class="footer">
                  <p><strong>FinTech Bank</strong><br>
                  Customer Support: support@fintechbank.com | Phone: 1800-FINTECH<br>
                  This is an automated email. Please do not reply to this message.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return { subject, body };
  }
  
  /**
   * Login Alert Email
   * @param {Object} data - Template data
   * @param {String} data.full_name - User's full name
   * @param {String} data.login_time - Login timestamp
   * @param {String} data.ip_address - Login IP address
   * @param {String} data.user_agent - User agent string
   * @returns {Object} - { subject, body }
   */
  static loginAlert(data) {
    const subject = 'FinTech Bank - New Login Detected';
    
    const body = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Login Alert</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #2c5aa0; }
              .alert-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .details-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
              .security-tips { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🏦 FinTech Bank</div>
                  <p style="margin: 10px 0 0 0; color: #666;">Security Alert</p>
              </div>
              
              <div class="content">
                  <h2 style="color: #2c5aa0;">Hello ${data.full_name},</h2>
                  
                  <div class="alert-box">
                      <h3 style="margin-top: 0;">🔐 New Login Detected</h3>
                      <p>We detected a new login to your FinTech Bank account.</p>
                  </div>
                  
                  <div class="details-box">
                      <strong>Login Details:</strong><br>
                      Time: ${data.login_time}<br>
                      IP Address: ${data.ip_address}<br>
                      Device/Browser: ${data.user_agent || 'Unknown'}<br>
                  </div>
                  
                  <p><strong>Was this you?</strong></p>
                  <p>If you recognize this login, no action is needed. This alert is sent for your security.</p>
                  
                  <p><strong>Didn't recognize this login?</strong></p>
                  <p>If this wasn't you, please:</p>
                  <ol>
                      <li>Change your password immediately</li>
                      <li>Contact our security team at security@fintechbank.com</li>
                      <li>Review your recent account activity</li>
                  </ol>
                  
                  <div class="security-tips">
                      <h4 style="margin-top: 0;">🛡️ Security Tips:</h4>
                      <ul>
                          <li>Never share your login credentials</li>
                          <li>Use strong, unique passwords</li>
                          <li>Always log out when using shared devices</li>
                          <li>Enable notifications for account activities</li>
                      </ul>
                  </div>
              </div>
              
              <div class="footer">
                  <p><strong>FinTech Bank Security Team</strong><br>
                  Report Security Issues: security@fintechbank.com<br>
                  This is an automated security alert.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return { subject, body };
  }
  
  /**
   * KYC Pending Reminder Email
   * @param {Object} data - Template data
   * @param {String} data.full_name - User's full name
   * @param {String} data.registration_date - Registration date
   * @returns {Object} - { subject, body }
   */
  static kycPending(data) {
    const subject = 'Action Required: Complete Your KYC Verification - FinTech Bank';
    
    const body = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>KYC Verification Pending</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #2c5aa0; }
              .urgent-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .requirements { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
              .cta-button { background-color: #2c5aa0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🏦 FinTech Bank</div>
                  <p style="margin: 10px 0 0 0; color: #666;">KYC Verification Required</p>
              </div>
              
              <div class="content">
                  <h2 style="color: #2c5aa0;">Dear ${data.full_name},</h2>
                  
                  <div class="urgent-box">
                      <h3 style="margin-top: 0;">📋 Action Required: Complete KYC Verification</h3>
                      <p>Your account activation is pending KYC (Know Your Customer) verification.</p>
                  </div>
                  
                  <p>To comply with banking regulations and activate your account, please complete your KYC verification process.</p>
                  
                  <div class="requirements">
                      <h4 style="margin-top: 0; color: #2c5aa0;">📄 Required Documents:</h4>
                      <ul>
                          <li><strong>Identity Proof:</strong> Aadhaar Card, PAN Card, or Passport</li>
                          <li><strong>Address Proof:</strong> Utility Bill, Bank Statement, or Rental Agreement</li>
                          <li><strong>Recent Photograph:</strong> Clear selfie or passport-size photo</li>
                      </ul>
                      
                      <h4 style="color: #2c5aa0;">✅ KYC Benefits:</h4>
                      <ul>
                          <li>Account activation and full banking access</li>
                          <li>Higher transaction limits</li>
                          <li>Enhanced security features</li>
                          <li>Access to premium banking services</li>
                      </ul>
                  </div>
                  
                  <p style="text-align: center;">
                      <a href="#" class="cta-button">Complete KYC Verification</a>
                  </p>
                  
                  <p><strong>Account Status:</strong> Inactive (Since ${data.registration_date})</p>
                  <p><strong>Time to Complete:</strong> 5-10 minutes</p>
                  <p><strong>Verification Time:</strong> 24-48 hours after submission</p>
              </div>
              
              <div class="footer">
                  <p><strong>FinTech Bank KYC Team</strong><br>
                  Need Help? kyc@fintechbank.com | 1800-FINTECH<br>
                  This email was sent regarding your account registration.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return { subject, body };
  }
  
  /**
   * KYC Approved Email
   * @param {Object} data - Template data
   * @param {String} data.full_name - User's full name
   * @returns {Object} - { subject, body }
   */
  static kycApproved(data) {
    const subject = '🎉 KYC Verified! Your FinTech Bank Account is Now Active';
    
    const body = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>KYC Verification Approved</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #2c5aa0; }
              .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
              .features { background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
              .cta-button { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">🏦 FinTech Bank</div>
                  <p style="margin: 10px 0 0 0; color: #666;">Account Activation Confirmed</p>
              </div>
              
              <div class="content">
                  <div class="success-box">
                      <h2 style="color: #28a745; margin-top: 0;">🎉 Congratulations ${data.full_name}!</h2>
                      <p style="font-size: 18px; margin: 0;"><strong>Your KYC verification is APPROVED!</strong></p>
                  </div>
                  
                  <p>Your FinTech Bank account is now fully <strong>ACTIVE</strong> and ready to use.</p>
                  
                  <div class="features">
                      <h4 style="margin-top: 0; color: #2c5aa0;">🚀 You Can Now:</h4>
                      <ul>
                          <li>Transfer money to any bank account</li>
                          <li>Receive payments and deposits</li>
                          <li>Pay bills and utilities</li>
                          <li>Apply for loans and credit products</li>
                          <li>Access premium banking services</li>
                          <li>Set up automatic payments</li>
                      </ul>
                  </div>
                  
                  <p style="text-align: center;">
                      <a href="#" class="cta-button">Start Banking Now</a>
                  </p>
                  
                  <p>Thank you for choosing FinTech Bank. We're excited to be your banking partner!</p>
              </div>
              
              <div class="footer">
                  <p><strong>FinTech Bank</strong><br>
                  Customer Support: support@fintechbank.com | 1800-FINTECH<br>
                  Welcome to the future of banking!</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return { subject, body };
  }
  
  /**
   * Get template by notification type
   * @param {String} type - Notification type
   * @param {Object} data - Template data
   * @returns {Object} - { subject, body }
   */
  static getTemplate(type, data) {
    switch (type.toUpperCase()) {
      case 'USER_REGISTRATION':
        return this.userRegistration(data);
      case 'LOGIN_ALERT':
        return this.loginAlert(data);
      case 'KYC_PENDING':
        return this.kycPending(data);
      case 'KYC_VERIFIED':
        return this.kycApproved(data);
      default:
        throw new Error(`Template not found for type: ${type}`);
    }
  }
}

module.exports = EmailTemplates;