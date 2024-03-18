import React, { useState } from 'react'

const Register = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

  return (
    <>
        <div className="bg-blue-50 h-screen flex items-center">
            <form action="" className='w-64 mx-auto mb-12' >
                <input type="text" value={username} onChange={ev => setUsername(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder='Username' />
                <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder='Password' />
                <button className='bg-blue-500 text-white block w-full rounded-sm '>Register</button>
            </form>
        </div>
    </>
  )
}

export default Register
