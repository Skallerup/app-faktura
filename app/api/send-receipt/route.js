import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TO_EMAIL = '85c3e708ce@inbox.hifranklin.com'

export async function POST(request) {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    console.error('Manglende miljøvariabler: GMAIL_USER eller GMAIL_APP_PASSWORD ikke sat')
    return NextResponse.json(
      { error: 'Server ikke konfigureret korrekt — miljøvariabler mangler' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Ingen fil modtaget' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const now = new Date()
    const dateStr = now.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const timeStr = now.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const ext = file.type === 'application/pdf' ? 'pdf'
      : file.type === 'image/png' ? 'png'
      : 'jpg'
    const filename = `bilag-${now.toISOString().slice(0, 10)}-${now.getTime()}.${ext}`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    await transporter.verify()

    const info = await transporter.sendMail({
      from: `"Bilag Scanner" <${gmailUser}>`,
      to: TO_EMAIL,
      bcc: gmailUser,
      subject: `Bilag ${dateStr}`,
      text: `Bilag modtaget ${dateStr} kl. ${timeStr}`,
      attachments: [
        {
          filename,
          content: buffer,
          contentType: file.type || 'image/jpeg',
        },
      ],
    })

    console.log('Email sendt:', info.messageId, '→', TO_EMAIL)
    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error('Email fejl:', err.message)
    return NextResponse.json(
      { error: 'Kunne ikke sende email', details: err.message },
      { status: 500 }
    )
  }
}
