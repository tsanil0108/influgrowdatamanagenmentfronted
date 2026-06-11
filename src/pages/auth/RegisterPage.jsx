import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Select, Button, Alert } from 'antd'
import { registerApi } from '../../api/authApi'
import logo from '../../assets/logo.png'   // ← apna file naam

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onFinish = async (values) => {
    setError(''); setSuccess('')
    if (values.password !== values.confirmPassword) { setError('Passwords do not match'); return }
    try {
      setLoading(true)
      await registerApi({ fullName: values.fullName, username: values.username, email: values.email, password: values.password, role: values.role })
      setSuccess('Account created successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: 480, background: '#fff', border: '1px solid #E8E0D5', borderRadius: 20, padding: '44px 40px', boxShadow: '0 2px 24px rgba(30,20,10,0.08)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <img src={logo} alt="InfluGrow" style={{ height: 40, objectFit: 'contain' }} />
        </div>

        <h2 style={{ textAlign: 'center', fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 600, color: '#1A1612', marginBottom: 6 }}>Create account</h2>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#7A6F65', marginBottom: 28 }}>Join InfluGrow — it only takes a minute</p>

        {error   && <Alert type="error"   message={error}   showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: 'STAFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
              <Input size="large" placeholder="Enter your full name " />
            </Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: true }]}>
              <Input size="large" placeholder="Enter user name" />
            </Form.Item>
          </div>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" placeholder="" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Form.Item label="Password" name="password" rules={[{ required: true }]}>
              <Input.Password size="large" placeholder="••••••••" />
            </Form.Item>
            <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true }]}>
              <Input.Password size="large" placeholder="••••••••" />
            </Form.Item>
          </div>
          <Form.Item label="Role" name="role">
            <Select size="large" options={[{ value: 'STAFF', label: 'Staff' }, { value: 'ADMIN', label: 'Admin' }]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}
            style={{ width: '100%', height: 48, background: '#C8531A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
            Create Account →
          </Button>
        </Form>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: '#7A6F65', marginTop: 18 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C8531A', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}