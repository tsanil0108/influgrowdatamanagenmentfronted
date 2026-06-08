import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Select, Button, Alert } from 'antd'
import { registerApi } from '../../api/authApi'

const cardStyle = {
  minHeight: '100vh', background: '#FDFAF5',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: 20,
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onFinish = async (values) => {
    setError('')
    setSuccess('')
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      await registerApi({
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      })
      setSuccess('Account created successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={cardStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: 480, background: '#fff', border: '1px solid #E8E0D5', borderRadius: 20, padding: '44px 40px', boxShadow: '0 2px 24px rgba(30,20,10,0.08)' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: '#C8531A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 600, color: '#1A1612' }}>InfluGrow</span>
        </div>

        <h2 style={{ textAlign: 'center', fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 600, color: '#1A1612', marginBottom: 6 }}>Create account</h2>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#7A6F65', marginBottom: 28 }}>Join InfluGrow — it only takes a minute</p>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: 'STAFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
              <Input size="large" placeholder="Annu Thakur" />
            </Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: true }]}>
              <Input size="large" placeholder="annu" />
            </Form.Item>
          </div>

          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" placeholder="annu00193@gmail.com" />
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
            <Select size="large" options={[
              { value: 'STAFF', label: 'Staff' },
              { value: 'ADMIN', label: 'Admin' },
            ]} />
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