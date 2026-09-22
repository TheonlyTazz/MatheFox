import type {
  CertificateData,
  CertificateRenderOptions,
  CertificateShareResult,
} from '../types/certificate'

export const DEFAULT_CERTIFICATE_NICKNAME = 'MatheFox'
export const CERTIFICATE_NICKNAME_MAX_LENGTH = 20
export const CERTIFICATE_PRIVACY_NOTE = 'Nur dein Name und dein Ergebnis - keine Daten werden online gespeichert.'

const emailLikePattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
const sensitivePattern = /(passwort|password|secret|token|api[-\s]?key|telefon|\btel\.?\b|adresse|anschrift|email|e-mail|@|https?:\/\/|www\.)/iu
const phoneLikePattern = /(?:\+?\d[\d\s()./-]{6,}\d)/u

export const normalizeCertificateNickname = (value: string | undefined): string => {
  if (value === undefined) return DEFAULT_CERTIFICATE_NICKNAME
  return value.trim().replace(/\s+/gu, ' ')
}

export const validateCertificateNickname = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const nickname = normalizeCertificateNickname(value)
  if (nickname.length === 0 || nickname.length > CERTIFICATE_NICKNAME_MAX_LENGTH) return false
  if (emailLikePattern.test(nickname) || sensitivePattern.test(nickname) || phoneLikePattern.test(nickname)) return false
  return true
}

export const assertCertificateNickname = (value: string | undefined): string => {
  const nickname = normalizeCertificateNickname(value)
  if (!validateCertificateNickname(nickname)) {
    throw new Error('Bitte gib einen kurzen Spitznamen ohne E-Mail-Adresse, Telefonnummer oder private Daten ein.')
  }
  return nickname
}

export const formatCertificateDate = (date: Date): string => {
  if (Number.isNaN(date.getTime())) throw new Error('Das Zertifikatsdatum ist ungültig.')
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const isCertificateData = (value: unknown): value is CertificateData => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  const result = candidate.result
  if (result === null || typeof result !== 'object' || Array.isArray(result)) return false
  const resultRecord = result as Record<string, unknown>
  return typeof candidate.awardTitle === 'string'
    && candidate.awardTitle.trim().length > 0
    && typeof resultRecord.label === 'string'
    && resultRecord.label.trim().length > 0
    && typeof resultRecord.value === 'string'
    && resultRecord.value.trim().length > 0
    && candidate.issuedAt instanceof Date
    && !Number.isNaN(candidate.issuedAt.getTime())
}

const assertCertificateData = (certificate: CertificateData): void => {
  if (!isCertificateData(certificate)) throw new Error('Die Zertifikatsdaten sind ungültig.')
}

const getCanvasContext = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D => {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new Error('Zertifikate können in dieser Umgebung nicht als Bild erstellt werden.')
  }
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Dein Browser kann keine Zertifikatsbilder erstellen. Bitte probiere einen anderen Browser.')
  if (typeof context.roundRect !== 'function') {
    throw new Error('Dein Browser unterstützt die Zertifikatsdarstellung nicht vollständig.')
  }
  canvas.width = width
  canvas.height = height
  return context
}

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void => {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

const drawCertificate = (
  context: CanvasRenderingContext2D,
  certificate: CertificateData,
  nickname: string,
  width: number,
  height: number,
): void => {
  const date = formatCertificateDate(certificate.issuedAt)
  context.fillStyle = '#fff7ed'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#ffffff'
  roundedRect(context, 36, 36, width - 72, height - 72, 32)
  context.fill()
  context.strokeStyle = '#fed7aa'
  context.lineWidth = 4
  context.stroke()

  context.textAlign = 'center'
  context.fillStyle = '#ea580c'
  context.font = '800 34px Nunito, Trebuchet MS, sans-serif'
  context.fillText('MatheFox', width / 2, 102)
  context.font = '48px sans-serif'
  context.fillText('★', width / 2, 164)

  context.fillStyle = '#3b2f2f'
  context.font = '800 46px Nunito, Trebuchet MS, sans-serif'
  context.fillText('Zertifikat', width / 2, 238)
  context.fillStyle = '#7c2d12'
  context.font = '700 30px Nunito, Trebuchet MS, sans-serif'
  context.fillText(certificate.awardTitle, width / 2, 296)

  context.fillStyle = '#57534e'
  context.font = '600 24px Nunito, Trebuchet MS, sans-serif'
  context.fillText('Das hat geschafft:', width / 2, 366)
  context.fillStyle = '#ea580c'
  context.font = '900 44px Nunito, Trebuchet MS, sans-serif'
  context.fillText(nickname, width / 2, 426)

  context.fillStyle = '#44403c'
  context.font = '700 26px Nunito, Trebuchet MS, sans-serif'
  context.fillText(`${certificate.result.label}: ${certificate.result.value}`, width / 2, 496)
  context.fillStyle = '#78716c'
  context.font = '500 21px Nunito, Trebuchet MS, sans-serif'
  context.fillText(`Ausgestellt am ${date}`, width / 2, 552)
  context.font = '500 17px Nunito, Trebuchet MS, sans-serif'
  context.fillText(CERTIFICATE_PRIVACY_NOTE, width / 2, height - 70)
}

export const createCertificateCanvas = (
  certificate: CertificateData,
  nickname: string | undefined,
  options: CertificateRenderOptions = {},
): HTMLCanvasElement => {
  assertCertificateData(certificate)
  const safeNickname = assertCertificateNickname(nickname)
  if (!certificate.awardTitle.trim()) throw new Error('Ein Auszeichnungstitel ist erforderlich.')
  if (!certificate.result.label.trim() || !certificate.result.value.trim()) {
    throw new Error('Ein Ergebnis mit Bezeichnung und Wert ist erforderlich.')
  }
  const width = options.width ?? 1200
  const height = options.height ?? 700
  if (!Number.isInteger(width) || width < 400 || !Number.isInteger(height) || height < 300) {
    throw new Error('Die Zertifikatsgröße ist ungültig.')
  }
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new Error('Zertifikate können in dieser Umgebung nicht als Bild erstellt werden.')
  }
  const canvas = document.createElement('canvas')
  const context = getCanvasContext(canvas, width, height)
  drawCertificate(context, certificate, safeNickname, width, height)
  return canvas
}

export const createCertificatePreviewDataUrl = (
  certificate: CertificateData,
  nickname: string | undefined,
): string => {
  const canvas = createCertificateCanvas(certificate, nickname, { width: 900, height: 525 })
  if (typeof canvas.toDataURL !== 'function') throw new Error('Dein Browser kann keine Zertifikatsvorschau erstellen.')
  return canvas.toDataURL('image/png')
}

export const generateCertificatePng = async (
  certificate: CertificateData,
  nickname: string | undefined,
): Promise<Blob> => {
  const canvas = createCertificateCanvas(certificate, nickname)
  if (typeof canvas.toBlob !== 'function') throw new Error('Dein Browser kann keine PNG-Zertifikate erstellen.')
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('Das Zertifikat konnte nicht als PNG erstellt werden.'))
    }, 'image/png')
  })
  return blob
}

const certificateFileName = (certificate: CertificateData): string => (
  `mathefox-${certificate.awardTitle.toLocaleLowerCase('de-DE').replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '') || 'zertifikat'}.png`
)

const downloadBlob = (blob: Blob, fileName: string): void => {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('Dein Browser kann das Zertifikat nicht herunterladen.')
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const downloadCertificate = async (
  certificate: CertificateData,
  nickname: string | undefined,
): Promise<void> => {
  const blob = await generateCertificatePng(certificate, nickname)
  downloadBlob(blob, certificateFileName(certificate))
}

export const shareCertificate = async (
  certificate: CertificateData,
  nickname: string | undefined,
): Promise<CertificateShareResult> => {
  const blob = await generateCertificatePng(certificate, nickname)
  if (typeof File !== 'function') {
    downloadBlob(blob, certificateFileName(certificate))
    return 'downloaded'
  }
  const file = new File([blob], certificateFileName(certificate), { type: 'image/png' })
  const navigatorWithShare = typeof navigator !== 'undefined' ? navigator : undefined
  let canShareFiles = false
  if (typeof navigatorWithShare?.canShare === 'function') {
    try {
      canShareFiles = navigatorWithShare.canShare({ files: [file] })
    } catch (error) {
      if (!(error instanceof TypeError)) throw error
    }
  }
  if (typeof navigatorWithShare?.share === 'function' && canShareFiles) {
    await navigatorWithShare.share({
      title: `MatheFox: ${certificate.awardTitle}`,
      text: `${assertCertificateNickname(nickname)} hat ein MatheFox-Zertifikat geschafft!`,
      files: [file],
    })
    return 'shared'
  }
  downloadBlob(blob, file.name)
  return 'downloaded'
}
