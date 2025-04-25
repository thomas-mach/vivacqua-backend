exports.messageNewUser = (name, URL) =>
  `
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
      <h1 style="color: #333;">Bentornato, ${name}!</h1>
      <p style="font-size: 16px; color: #555;">Clicca sul pulsante qui sotto per attivare il tuo account:</p>
      <a href="${URL}" 
         style="display: inline-block; padding: 12px 24px; font-size: 16px; 
                color: #fff; background-color: #28a745; text-decoration: none; 
                border-radius: 5px; font-weight: bold;">
        Attiva Account
      </a>
    </div>
  `;

exports.messageDeactivatedUser = (name, URL) => `
    <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">Hi, ${name}. Your account has been deactivated.</h1>
      <p style="font-size: 16px; color: #555;">Click the button below to activate:</p>
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
    <h1 style="color: #333;">Richiesta di reimpostazione della password</h1>
    <p style="font-size: 16px; color: #555;">Abbiamo ricevuto una richiesta per reimpostare la password del suo account.</p>
    <p style="font-size: 16px; color: #555;">Per procedere, clicchi sul pulsante sottostante:</p>
    <a href="${URL}" 
    style="display: inline-block; padding: 12px 24px; font-size: 16px; 
    color: #fff; background-color: #28a745; text-decoration: none; 
    border-radius: 5px; font-weight: bold;">
    Reimposta la password
    </a>
    <p style="font-size: 16px; color: #555;">Il link sarà valido per 10 minuti. Se non ha effettuato questa richiesta, può ignorare questo messaggio.</p>
  </div>
`;
