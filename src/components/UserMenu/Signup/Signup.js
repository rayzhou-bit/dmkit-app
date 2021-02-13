import React from 'react';

const SignUp = (props) => {
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

export default SignUp;