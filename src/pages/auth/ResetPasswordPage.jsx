import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Alert } from 'antd'
import { resetPasswordApi } from '../../api/authApi'
import logo from '../../assets/logo.png'   // ← apna file naam

function OtpInput({ value, onChange }) {
  const refs = useRef([])
  const digits = (value || '      ').split('')

  const handleChange = (e, i) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = ch
    onChange(next.join(''))
    if (ch && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) { onChange(pasted.padEnd(6, ' ')); refs.current[Math.min(pasted.length, 5)]?.focus() }
    e.preventDefault()
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => refs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ''} onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)} onPaste={handlePaste}
          style={{ flex: 1, width: 0, height: 52, textAlign: 'center', border: '1.5px solid #E8E0D5', borderRadius: 10, background: '#F9F6F1', fontSize: 20, fontWeight: 600, color: '#1A1612', fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color .2s' }}
          onFocus={e => (e.target.style.borderColor = '#C8531A')}
          onBlur={e  => (e.target.style.borderColor = '#E8E0D5')}
        />
      ))}
    </div>
  )
}

export default function ResetPasswordPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [form]    = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [otp,     setOtp]     = useState('      ')
  const prefillEmail = location.state?.email || ''

  const onFinish = async (values) => {
    setError(''); setSuccess('')
    const cleanOtp = otp.trim()
    if (cleanOtp.length < 6) { setError('Please enter the complete 6-digit OTP.'); return }
    if (values.newPassword !== values.confirmPassword) { setError('Passwords do not match.'); return }
    try {
      setLoading(true)
      await resetPasswordApi({ email: values.email, otp: cleanOtp, newPassword: values.newPassword, confirmPassword: values.confirmPassword })
      setSuccess('Password reset successfully! Redirecting...')
      setTimeout(() => navigate('/login'), 1600)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check your OTP and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: 440, background: '#FFFFFF', border: '1px solid #E8E0D5', borderRadius: 20, padding: '44px 40px', boxShadow: '0 2px 20px rgba(30,20,10,0.07)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <img src={logo} alt="InfluGrow" style={{ height: 40, objectFit: 'contain' }} />
        </div>

        {/* Step indicator - same as before */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 26 }}>
          {[{ done: true, now: false }, { done: false, now: true }, { done: false, now: false }].map((s, i) => (
            <div key={i} style={{ height: 8, width: s.now ? 22 : 8, borderRadius: s.now ? 4 : '50%', background: (s.done || s.now) ? '#C8531A' : '#E8E0D5', opacity: s.done ? 0.45 : 1, transition: 'all .3s' }} />
          ))}
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, textAlign: 'center', color: '#1A1612', marginBottom: 6 }}>Reset password</h2>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#7A6F65', lineHeight: 1.6, marginBottom: 24 }}>
          Enter your email, the OTP we sent,<br />and choose a new password.
        </p>

        {error   && <Alert type="error"   message={error}   showIcon style={{ marginBottom: 16 }} />}
        {success && <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />}

        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ email: prefillEmail }}>
          <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input size="large" placeholder="annu00193@gmail.com" />
          </Form.Item>
          <Form.Item label="6-digit OTP" required>
            <OtpInput value={otp} onChange={setOtp} />
          </Form.Item>
          <Form.Item label="New password" name="newPassword" rules={[{ required: true, message: 'Enter your new password' }, { min: 6, message: 'At least 6 characters required' }]}>
            <Input.Password size="large" placeholder="Min. 6 characters" />
          </Form.Item>
          <Form.Item label="Confirm password" name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password' }, ({ getFieldValue }) => ({ validator(_, val) { if (!val || getFieldValue('newPassword') === val) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match')) } })]}>
            <Input.Password size="large" placeholder="Repeat password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block
            style={{ height: 48, background: '#C8531A', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600 }}>
            Reset Password ✓
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#7A6F65' }}>
          Didn't get the OTP?{' '}
          <Link to="/forgot-password" style={{ color: '#C8531A', fontWeight: 600 }}>Resend</Link>
        </div>
      </div>
    </div>
  )
}