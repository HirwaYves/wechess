// src/pages/register.jsx
import { useState } from 'react'
import './register.css'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    chessRating: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [statusMsg, setStatusMsg] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email'
    }
    if (formData.chessRating && isNaN(formData.chessRating)) {
      newErrors.chessRating = 'Rating must be a number'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatusMsg('')

    const newErrors = validate()
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim() || null,
          country: formData.country.trim(),
          rating: formData.chessRating
            ? Number(formData.chessRating)
            : null,
          password: formData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setStatusMsg('Account created successfully! You can now login.')

      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        chessRating: '',
        password: ''
      })

    } catch (err) {
      setStatusMsg('Error: ' + err.message)
    }
  }

  return (
    <section className="register">
      <div className="container register-container">
        <h1 className="page-title">Create Account</h1>

        <form onSubmit={handleSubmit} noValidate>

          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p>{errors.username}</p>}

          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <p>{errors.firstName}</p>}

          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <p>{errors.lastName}</p>}

          <input
            name="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p>{errors.email}</p>}

          <input
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
          />
          {errors.country && <p>{errors.country}</p>}

          <input
            type="number"
            name="chessRating"
            placeholder="Chess Rating (optional)"
            value={formData.chessRating}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p>{errors.password}</p>}

          <button type="submit">Create Account</button>

          {statusMsg && <p>{statusMsg}</p>}
        </form>
      </div>
    </section>
  )
}

export default Register