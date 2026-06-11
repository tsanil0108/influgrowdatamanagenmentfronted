import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Alert } from 'antd'
import { forgotPasswordApi } from '../../api/authApi'
import logo from '../../assets/logo.png'   // ← apna file naam

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const onFinish = async ({ email }) => {
    setError(''); setSuccess('')
    try {
      setLoading(true)
      await forgotPasswordApi({ email })
      setSuccess('OTP sent! Check your inbox.')
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1600)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: 440, background: '#FFFFFF', border: '1px solid #E8E0D5', borderRadius: 20, padding: '44px 40px', boxShadow: '0 2px 20px rgba(30,20,10,0.07)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <img src={logo} alt="InfluGrow" style={{ height: 40, objectFit: 'contain' }} />
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, textAlign: 'center', color: '#1A1612', marginBottom: 6 }}>Forgot password?</h2>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#7A6F65', lineHeight: 1.6, marginBottom: 24 }}>
          No worries — we'll send a 6-digit OTP<br />to your registered email address.
        </p>

        <div style={{ background: '#FAF0EA', border: '1px solid #F0C9B0', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#A8421A', marginBottom: 20, display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.5 }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Check your spam folder if you don't see the email within a minute.
        </div>

        {error   && <Alert type="error"   message={error}   showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input size="large" placeholder="Enter your email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block
            style={{ height: 48, background: '#C8531A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
            Send OTP →
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#7A6F65' }}>
          Already have an OTP?{' '}
          <Link to="/reset-password" style={{ color: '#C8531A', fontWeight: 600 }}>Reset password</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13.5, color: '#7A6F65' }}>
          <Link to="/login" style={{ color: '#C8531A', fontWeight: 500 }}>← Back to login</Link>
        </div>
      </div>
    </div>
  )
}