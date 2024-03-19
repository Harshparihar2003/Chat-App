import React, { useContext, useState } from 'react'
import axios from "axios"
import { UserContext } from './UserContext';

const Register = () => {

  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register")
  const { setUsername, setId } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password })
    setUsername(username);
    setId(data.id);
  }

  return (
    <>
      <div className="bg-blue-50 h-screen flex items-center">
        <form action="" className='w-64 mx-auto mb-12' onSubmit={handleSubmit} >
          <input type="text" value={username} onChange={ev => setUser(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder='Username' />
          <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder='Password' />
          <button className='bg-blue-500 text-white block w-full rounded-sm '>
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
          <div className='text-center mt-2'>
            {
              isLoginOrRegister === "register" && (
                <div>
                  Already a member?
                  <button onClick={() => setIsLoginOrRegister("login")}> Login
                  </button>
                </div>
              )
            }
            {
              isLoginOrRegister === "login" && (
                <div>
                Dont have an account? 
                <button onClick={() => setIsLoginOrRegister("register")}>Register                 </button>
              </div>
              )
            }

          </div>
        </form>
      </div>
    </>
  )
}

export default Register
