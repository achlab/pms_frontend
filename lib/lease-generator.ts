import jsPDF from 'jspdf'

interface LeaseData {
  tenant: {
    name: string
    email: string
    phone?: string
    ghanaCardId?: string
    address?: string
  }
  property: {
    name: string
    address: string
    type?: string
    gpsAddress?: string
  }
  landlord?: {
    name: string
    email?: string
    phone?: string
  }
  lease: {
    startDate: string
    endDate: string
    monthlyRent: number
    securityDeposit: number
    duration: string // e.g., "12 months"
  }
}

export function generateLeaseAgreementPDF(data: LeaseData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let currentY = 30

  // Helper function to add text with automatic line wrapping
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: string; maxWidth?: number }) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize)
    if (options?.fontStyle) doc.setFont('helvetica', options.fontStyle as any)
    
    if (options?.maxWidth) {
      const lines = doc.splitTextToSize(text, options.maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * (options.fontSize || 12) * 0.4)
    } else {
      doc.text(text, x, y)
      return y + ((options?.fontSize || 12) * 0.4)
    }
  }

  // Helper function to add a section with spacing
  const addSection = (content: () => number) => {
    const newY = content()
    currentY = newY + 10
    return currentY
  }

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('RESIDENTIAL LEASE AGREEMENT', pageWidth / 2, currentY, { align: 'center' })
  currentY += 20

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('REPUBLIC OF GHANA', pageWidth / 2, currentY, { align: 'center' })
  currentY += 20

  // Agreement Date
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
  
  addSection(() => {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    return addText(`This Lease Agreement is made this ${today} between:`, margin, currentY)
  })

  // Landlord Section
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('LANDLORD/LESSOR:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    
    doc.setFont('helvetica', 'normal')
    y = addText(`Name: ${data.landlord?.name || 'Property Owner'}`, margin + 10, y + 5)
    if (data.landlord?.email) {
      y = addText(`Email: ${data.landlord.email}`, margin + 10, y + 5)
    }
    if (data.landlord?.phone) {
      y = addText(`Phone: ${data.landlord.phone}`, margin + 10, y + 5)
    }
    
    return y
  })

  // Tenant Section
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('TENANT/LESSEE:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    
    doc.setFont('helvetica', 'normal')
    y = addText(`Name: ${data.tenant.name}`, margin + 10, y + 5)
    y = addText(`Email: ${data.tenant.email}`, margin + 10, y + 5)
    if (data.tenant.phone) {
      y = addText(`Phone: ${data.tenant.phone}`, margin + 10, y + 5)
    }
    if (data.tenant.ghanaCardId) {
      y = addText(`Ghana Card ID: ${data.tenant.ghanaCardId}`, margin + 10, y + 5)
    }
    
    return y
  })

  // Property Description
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('PROPERTY DESCRIPTION:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    
    doc.setFont('helvetica', 'normal')
    y = addText(`Property Name: ${data.property.name}`, margin + 10, y + 5)
    y = addText(`Address: ${data.property.address}`, margin + 10, y + 5, { maxWidth: pageWidth - 2 * margin - 10 })
    if (data.property.gpsAddress) {
      y = addText(`Ghana Post GPS: ${data.property.gpsAddress}`, margin + 10, y + 5)
    }
    if (data.property.type) {
      y = addText(`Property Type: ${data.property.type}`, margin + 10, y + 5)
    }
    
    return y
  })

  // Lease Terms
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('LEASE TERMS:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    
    doc.setFont('helvetica', 'normal')
    y = addText(`Lease Duration: ${data.lease.duration}`, margin + 10, y + 5)
    y = addText(`Start Date: ${data.lease.startDate}`, margin + 10, y + 5)
    y = addText(`End Date: ${data.lease.endDate}`, margin + 10, y + 5)
    y = addText(`Monthly Rent: GH₵ ${data.lease.monthlyRent.toLocaleString()}`, margin + 10, y + 5)
    y = addText(`Security Deposit: GH₵ ${data.lease.securityDeposit.toLocaleString()}`, margin + 10, y + 5)
    
    return y
  })

  // Terms and Conditions
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('TERMS AND CONDITIONS:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    
    doc.setFont('helvetica', 'normal')
    const terms = [
      '1. The tenant agrees to pay rent monthly in advance by the 5th day of each month.',
      '2. The security deposit will be refunded within 30 days after the lease ends, subject to property condition.',
      '3. The tenant is responsible for utilities unless otherwise specified.',
      '4. No subletting is allowed without written consent from the landlord.',
      '5. The tenant must maintain the property in good condition and report any damages immediately.',
      '6. Either party may terminate this lease with 30 days written notice.',
      '7. This agreement is governed by the laws of Ghana.'
    ]
    
    terms.forEach(term => {
      y = addText(term, margin + 10, y + 8, { maxWidth: pageWidth - 2 * margin - 10 })
    })
    
    return y
  })

  // Check if we need a new page
  if (currentY > 200) {
    doc.addPage()
    currentY = 30
  }

  // Signatures Section
  addSection(() => {
    doc.setFont('helvetica', 'bold')
    let y = addText('SIGNATURES:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    y += 20
    
    doc.setFont('helvetica', 'normal')
    
    // Landlord signature
    y = addText('LANDLORD/LESSOR:', margin, y)
    y += 15
    doc.line(margin, y, margin + 80, y) // Signature line
    y = addText('Signature', margin, y + 8, { fontSize: 10 })
    y += 5
    doc.line(margin + 100, y - 20, margin + 180, y - 20) // Date line
    y = addText('Date', margin + 100, y - 12, { fontSize: 10 })
    
    y += 20
    
    // Tenant signature
    y = addText('TENANT/LESSEE:', margin, y)
    y += 15
    doc.line(margin, y, margin + 80, y) // Signature line
    y = addText('Signature', margin, y + 8, { fontSize: 10 })
    y += 5
    doc.line(margin + 100, y - 20, margin + 180, y - 20) // Date line
    y = addText('Date', margin + 100, y - 12, { fontSize: 10 })
    
    return y
  })

  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('This is a computer-generated document. No signature is required for validity.', 
           pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

  // Generate filename
  const filename = `lease-agreement-${data.tenant.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`

  // Save the PDF
  doc.save(filename)
}

// Helper function to format lease data from tenant and property information
export function formatLeaseData(tenant: any, property: any, leaseTerms?: {
  startDate?: string
  endDate?: string
  monthlyRent?: number
  securityDeposit?: number
  duration?: string
}): LeaseData {
  const today = new Date()
  const startDate = leaseTerms?.startDate || today.toISOString().split('T')[0]
  const endDate = leaseTerms?.endDate || new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]
  
  return {
    tenant: {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      ghanaCardId: tenant.ghanaCardId,
      address: tenant.previousAddress
    },
    property: {
      name: property.name,
      address: property.address,
      type: property.type,
      gpsAddress: property.gpsAddress
    },
    landlord: {
      name: 'Property Owner', // This could be fetched from the current user or property owner
      email: 'landlord@propertyhub.com',
      phone: '+233 24 123 4567'
    },
    lease: {
      startDate,
      endDate,
      monthlyRent: leaseTerms?.monthlyRent || property.monthlyRevenue || 2500,
      securityDeposit: leaseTerms?.securityDeposit || (leaseTerms?.monthlyRent || property.monthlyRevenue || 2500),
      duration: leaseTerms?.duration || '12 months'
    }
  }
}
