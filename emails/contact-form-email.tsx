interface ContactFormEmailProps {
  name: string
  email: string
  message: string
}

export default function ContactFormEmail({ name, email, message }: ContactFormEmailProps) {
  return (
  <div
    style={{
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: '#f9fafb',
      padding: '32px',
      borderRadius: '12px',
      maxWidth: '480px',
      margin: '0 auto',
      border: '1px solid #e5e7eb',
      color: '#222'
    }}
  >
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <h1
        style={{
          fontSize: '1.5rem',
          margin: 0,
          color: '#2563eb',
          letterSpacing: '0.01em'
        }}
      >
        📬 New Contact Form Submission
      </h1>
    </div>
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        marginBottom: '20px'
      }}
    >
      <p style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>
        <span style={{ color: '#6b7280' }}>From:</span>{' '}
        <strong>{name}</strong> &lt;<a href={`mailto:${email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{email}</a>&gt;
      </p>
      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
      <h2
        style={{
          fontSize: '1.1rem',
          margin: '0 0 8px 0',
          color: '#111827'
        }}
      >
        Message
      </h2>
      <p
        style={{
          background: '#f3f4f6',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '1rem',
          margin: 0,
          whiteSpace: 'pre-line'
        }}
      >
        {message}
      </p>
    </div>
    <footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
      <span>Thank you for reaching out!</span>
    </footer>
  </div>
  )
}