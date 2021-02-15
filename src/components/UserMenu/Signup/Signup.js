import React from 'react';

const SignUp = (props) => {
  // Step 1: choose sign up method
  //  email/password
  //  google
  //  facebook
  // Step 2: depends on the option choosen... connects with the account
  // Step 3: setup account information (username for now)

  return (
    <div>
      <h1>Sign Up</h1>
      <form id="sign-up-form" onSubmit={e => emailSignUp(e)}>
        <div className="email row">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="Enter Email" name="email" required
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="password row">
          <label htmlFor="psw">Password</label>
          <input type="password" placeholder="Enter Password" name="psw" required 
            value={psw} onChange={e => setPsw(e.target.value)} />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

const Step1 = props => {
  return (
    <form>
      
    </form>
  );
};

export default SignUp;