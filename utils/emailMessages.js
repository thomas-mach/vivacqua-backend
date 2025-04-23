exports.messageNewUser = (name, URL) => `
  <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
    <h1 style="color: #333;">Benvenuto in Vivaqua, ${name}!</h1>
    <p style="font-size: 16px; color: #555;">Clicca sul pulsante qui sotto per attivare il tuo account:</p>
    <a href="${URL}" 
       style="display: inline-block; padding: 12px 24px; font-size: 16px; 
              color: #fff; background-color: #28a745; text-decoration: none; 
              border-radius: 5px; font-weight: bold;">
      Attiva il tuo account
    </a>
  </div>
`;

exports.messageExistingUser = (name, URL) => `
    <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">Welcome back, ${name}!</h1>
      <p style="font-size: 16px; color: #555;">Click the button below to activate your account:</p>
      <a href="${URL}" 
         style="display: inline-block; padding: 12px 24px; font-size: 16px; 
                color: #fff; background-color: #28a745; text-decoration: none; 
                border-radius: 5px; font-weight: bold;">
        Activate Account
      </a>
    </div>
  `;

exports.messageDeactivatedUser = (URL) => `
    <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">Your account has been deactivated, please sign up again.</h1>
      <p style="font-size: 16px; color: #555;">Click the button below to sign up:</p>
      <a href="${URL}" 
      style="display: inline-block; padding: 12px 24px; font-size: 16px; 
      color: #fff; background-color: #28a745; text-decoration: none; 
      border-radius: 5px; font-weight: bold;">
      Sign up again
      </a>
      <p style="font-size: 16px; color: #555;">This link will expire in 10 minutes.</p>
    </div>
  `;

exports.messageResetPassword = (URL) => `
    <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">Forgot your password? Click the link below to reset your password:</h1>
      <p style="font-size: 16px; color: #555;">Click the button below to reset your password:</p>
      <a href="${URL}" 
      style="display: inline-block; padding: 12px 24px; font-size: 16px; 
      color: #fff; background-color: #28a745; text-decoration: none; 
      border-radius: 5px; font-weight: bold;">
      Reset Password
      </a>
      <p style="font-size: 16px; color: #555;">This link will expire in 10 minutes.</p>
    </div>
  `;
