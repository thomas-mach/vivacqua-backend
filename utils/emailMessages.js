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

exports.messageOrderPaid = (orderId, orderTotal) => `
  <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
    <h1 style="color: #333;">Pagamento ricevuto ✅</h1>
    <p style="font-size: 16px; color: #555;">
      Grazie per il tuo acquisto! Abbiamo ricevuto il pagamento per il tuo ordine <strong>#${orderId}</strong>.
    </p>
    <p style="font-size: 16px; color: #555;">
      Totale dell'ordine: <strong>€${orderTotal.toFixed(2)}</strong>
    </p>
    <p style="font-size: 16px; color: #555;">
      Il tuo ordine è ora in fase di preparazione. Ti invieremo un altro messaggio quando sarà stato spedito.
    </p>
    <p style="font-size: 16px; color: #555;">
      Se hai domande o bisogno di assistenza, non esitare a contattarci.
    </p>
    <p style="margin-top: 30px; font-size: 14px; color: #999;">
      Questo è un messaggio automatico, ti preghiamo di non rispondere a questa email.
    </p>
  </div>
`;
