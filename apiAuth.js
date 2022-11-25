const genAPIKey = () => {
    return [...Array(30)]
      .map((e) => ((Math.random() * 36) | 0).toString(36))
      .join('');
  };

  const users = require('./initialData').users; 

const createUser = (_username, req) => {
  let today = new Date().toISOString().split('T')[0];
  let user = {
    _id: Date.now(),
    api_key: genAPIKey(),
    username: _username,
    usage: [{ date: today, count: 0 }],
  };

  console.log('add user');
  users.push(user);
  return user;
};

const authenticateKey = (req, res, next) => {
    let api_key = req.header("x-api-key"); //Add API key to headers
    let account = users.find((user) => user.api_key == api_key);
    if (account) {
      
      let today = new Date().toISOString().split("T")[0];
      let usageCount = account.usage.findIndex((day) => day.date == today);
      if (usageCount >= 0) {
        
        if (account.usage[usageCount].count >= MAX) {
        
          res.status(429).send({
            error: {
              code: 429,
              message: "Max API calls exceeded.",
            },
          });
        } else {
          account.usage[usageCount].count++;
          console.log("Good API call", account.usage[usageCount]);
          next();
        }
      } else {
        account.usage.push({ date: today, count: 1 });
        next();
      }
    } else {
      res.status(403).send({ error: { code: 403, message: "You not allowed." } });
    }
  };
  module.exports = { createUser, authenticateKey };