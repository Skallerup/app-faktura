import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const TO_EMAIL = '85c3e708ce@inbox.hifranklin.com'

export async function POST(request) {
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
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Bilag Scanner" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      subject: `Bilag ${dateStr}`,
      text: `Bilag modtaget ${dateStr} kl. ${timeStr}`,
      attachments: [
        {
          filename,
          content: buffer,
          contentType: file.type,
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email fejl:', err)
    return NextResponse.json(
      { error: 'Kunne ikke sende email', details: err.message },
      { status: 500 }
    )
  }
}
