'use client'

import { useState, useRef } from 'react'

const MAX_SIZE_MB = 4
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPTED = 'image/jpeg,image/jpg,image/png,application/pdf'

export default function ScanPage() {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const fileInputRef = useRef(null)

  const handleCapture = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    if (selected.size > MAX_SIZE_BYTES) {
      alert(`Filen er for stor. Maksimum er ${MAX_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }

    setFile(selected)
    setFileName(selected.name)
    setStatus('idle')

    if (selected.type === 'application/pdf') {
      setPreview('pdf')
    } else {
      const url = URL.createObjectURL(selected)
      setPreview(url)
    }
  }

  const handleSend = async () => {
    if (!file) return
    setStatus('sending')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setStatus('success')
        setPreview(null)
        setFile(null)
        setFileName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('Server error:', data)
        setStatus('error')
      }
    } catch (err) {
      console.error('Network error:', err)
      setStatus('error')
    }
  }

  const handleReset = () => {
    setPreview(null)
    setFile(null)
    setFileName('')
    setStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.header}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h1 style={styles.title}>Bilag Scanner</h1>
        </div>

        {status === 'success' ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successText}>Bilag sendt!</p>
            <p style={styles.successSub}>Bilaget er modtaget af din bogføring</p>
            <button style={styles.primaryBtn} onClick={handleReset}>
              Scan nyt bilag
            </button>
          </div>
        ) : (
          <>
            {!preview && (
              <div style={styles.captureArea}>
                <div style={styles.captureIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <p style={styles.captureHint}>Tag et foto eller vælg en fil</p>
                <button
                  style={styles.primaryBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Scan bilag
                </button>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                      setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 500)
                    }
                  }}
                >
                  Vælg fra galleri / PDF
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED}
                  capture="environment"
                  onChange={handleCapture}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {preview && preview !== 'pdf' && (
              <div style={styles.previewArea}>
                <img src={preview} alt="Bilag preview" style={styles.previewImg} />
              </div>
            )}

            {preview === 'pdf' && (
              <div style={styles.pdfPreview}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p style={styles.pdfName}>{fileName}</p>
                <p style={styles.pdfLabel}>PDF klar til afsendelse</p>
              </div>
            )}

            {preview && (
              <div style={styles.actions}>
                {status === 'error' && (
                  <p style={styles.errorText}>Kunne ikke sende. Prøv igen.</p>
                )}
                <button
                  style={{
                    ...styles.primaryBtn,
                    opacity: status === 'sending' ? 0.7 : 1,
                  }}
                  onClick={handleSend}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sender...' : 'Send bilag'}
                </button>
                <button style={styles.secondaryBtn} onClick={handleReset}>
                  Tag nyt billede
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <p style={styles.footer}>Bilaget sendes til din bogføring</p>
    </main>
  )
}

const styles = {
  main: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0f4ff 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(37, 99, 235, 0.10)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
  },
  captureArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 0',
  },
  captureIcon: {
    marginBottom: '8px',
  },
  captureHint: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '8px',
  },
  previewArea: {
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '2px solid #e2e8f0',
  },
  previewImg: {
    width: '100%',
    display: 'block',
    maxHeight: '400px',
    objectFit: 'contain',
    background: '#f8fafc',
  },
  pdfPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px 16px',
    background: '#fef2f2',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px dashed #fca5a5',
  },
  pdfName: {
    fontSize: '13px',
    color: '#64748b',
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  pdfLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ef4444',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    color: '#2563eb',
    border: '2px solid #2563eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#16a34a',
  },
  successSub: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: '16px',
    fontSize: '12px',
    color: '#94a3b8',
  },
}
