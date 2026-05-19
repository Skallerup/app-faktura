// Genererer PNG-ikoner dynamisk til PWA manifest
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const size = parseInt((await params).size) || 192

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2563eb"/>
  <rect x="${size * 0.25}" y="${size * 0.15}" width="${size * 0.5}" height="${size * 0.62}" rx="${size * 0.03}" fill="white"/>
  <rect x="${size * 0.31}" y="${size * 0.27}" width="${size * 0.375}" height="${size * 0.03}" rx="${size * 0.015}" fill="#2563eb"/>
  <rect x="${size * 0.31}" y="${size * 0.35}" width="${size * 0.31}" height="${size * 0.023}" rx="${size * 0.012}" fill="#93c5fd"/>
  <rect x="${size * 0.31}" y="${size * 0.41}" width="${size * 0.344}" height="${size * 0.023}" rx="${size * 0.012}" fill="#93c5fd"/>
  <rect x="${size * 0.31}" y="${size * 0.47}" width="${size * 0.28}" height="${size * 0.023}" rx="${size * 0.012}" fill="#93c5fd"/>
  <rect x="${size * 0.25}" y="${size * 0.625}" width="${size * 0.5}" height="${size * 0.004}" fill="#dbeafe"/>
  <rect x="${size * 0.31}" y="${size * 0.66}" width="${size * 0.19}" height="${size * 0.023}" rx="${size * 0.012}" fill="#2563eb"/>
  <rect x="${size * 0.5625}" y="${size * 0.66}" width="${size * 0.125}" height="${size * 0.023}" rx="${size * 0.012}" fill="#2563eb"/>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
