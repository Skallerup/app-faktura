import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PDFDocument } from 'pdf-lib'

const TO_EMAIL = '85c3e708ce@inbox.hifranklin.com'

async function convertToPdf(buffer, mimeType) {
  if (mimeType === 'application/pdf') return buffer

  const pdfDoc = await PDFDocument.create()

  const image = mimeType === 'image/png'
    ? await pdfDoc.embedPng(buffer)
    : await pdfDoc.embedJpg(buffer)

  const { width, height } = image.scale(1)
  const page = pdfDoc.addPage([width, height])
  page.drawImage(image, { x: 0, y: 0, width, height })

  return Buffer.from(await pdfDoc.save())
}

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

    const mimeType = file.type || 'image/jpeg'
    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const pdfBuffer = await convertToPdf(rawBuffer, mimeType)

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
    const filename = `bilag-${now.toISOString().slice(0, 10)}-${now.getTime()}.pdf`

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
          content: pdfBuffer,
          contentType: 'application/pdf',
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
