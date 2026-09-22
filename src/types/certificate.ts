export interface CertificateResult {
  label: string
  value: string
}

export interface CertificateData {
  awardTitle: string
  result: CertificateResult
  issuedAt: Date
}

export interface CertificateViewData {
  awardTitle: string
  result: CertificateResult
  issuedAt: string
}

export interface CertificateRenderOptions {
  width?: number
  height?: number
}

export type CertificateShareResult = 'shared' | 'downloaded'
