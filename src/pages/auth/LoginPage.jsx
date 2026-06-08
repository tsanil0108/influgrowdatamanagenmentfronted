import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Alert } from 'antd'
import { useDispatch } from 'react-redux'
import { login as loginApi } from '../../api/authApi'
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FDFAF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: 440,
    background: '#FFFFFF',
    border: '1px solid #E8E0D5',
    borderRadius: 20,
    padding: '44px 40px',
    boxShadow: '0 2px 24px rgba(30,20,10,0.08)',
  },
  brand: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10, marginBottom: 32,
  },
  brandIcon: {
    width: 36, height: 36, background: '#C8531A',
    borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: {
    fontFamily: "'Lora', serif", fontSize: 20,
    fontWeight: 600, color: '#1A1612',
  },
  title: {
    textAlign: 'center', fontFamily: "'Lora', serif",
    fontSize: 22, fontWeight: 600, color: '#1A1612', marginBottom: 6,
  },
  sub: {
    textAlign: 'center', fontSize: 13.5,
    color: '#7A6F65', marginBottom: 28,
  },
  submitBtn: {
    width: '100%', height: 48, background: '#C8531A',
    border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600,
  },
  linkRow: {
    textAlign: 'center', fontSize: 13.5,
    color: '#7A6F65', marginTop: 18,
  },
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const onFinish = async (values) => {
    setError('')
    dispatch(loginStart())
    try {
      setLoading(true)
      const res = await loginApi(values)

      // backend response structure handle karo
      // common patterns: { token, user } or { accessToken, ... } or flat object
      const token = res.data.token
                 ?? res.data.accessToken
                 ?? res.data.jwtToken

      const user  = res.data.user ?? {
        username: res.data.username,
        fullName: res.data.fullName,
        role:     res.data.role,
      }

      dispatch(loginSuccess({ token, user }))
      navigate('/dashboard')

    } catch (err) {
      const msg = err.response?.data?.message
               || err.response?.data?.error
               || 'Invalid username or password'
      dispatch(loginFailure(msg))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div style={styles.card}>

        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={styles.brandName}>InfluGrow</span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your InfluGrow account</p>

        {error && (
          <Alert
            type="error"
            description={error}
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input size="large" placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password size="large" placeholder="Enter your password" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 12.5, color: '#C8531A', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={styles.submitBtn}
            block
          >
            Sign In →
          </Button>
        </Form>

        <div style={styles.linkRow}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#C8531A', fontWeight: 600 }}>Create one</Link>
        </div>
      </div>
    </div>
  )
}