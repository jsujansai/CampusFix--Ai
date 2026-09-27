import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report, User } from '../types';

/**
 * Format CSV field safely escaping quotes and commas
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export student reports history to CSV
 */
export function exportReportsToCSV(reports: Report[], user?: User | null): void {
  const headers = [
    'Ticket ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Building',
    'Room / Specific Location',
    'Full Location',
    'Date Submitted',
    'Date Resolved',
    'Assigned Department',
    'Assigned Technician',
    'Updates Count',
    'Description'
  ];

  const rows = reports.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.title),
    escapeCSV(r.category),
    escapeCSV(r.priority),
    escapeCSV(r.status),
    escapeCSV(r.building || 'Campus'),
    escapeCSV(r.roomOrArea || ''),
    escapeCSV(r.location),
    escapeCSV(new Date(r.createdAt).toLocaleString()),
    escapeCSV(r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : 'N/A'),
    escapeCSV(r.assignedDepartment || 'Pending Assignment'),
    escapeCSV(r.assignedStaff || 'Unassigned'),
    escapeCSV(r.comments?.length || 0),
    escapeCSV(r.description)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const studentIdentifier = user?.rollNumber ? `_${user.rollNumber}` : '';
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `CampusFix_Issue_History${studentIdentifier}_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export student reports history to a professional PDF document
 */
export function exportReportsToPDF(reports: Report[], user?: User | null): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Header Banner
  doc.setFillColor(30, 58, 138); // Deep royal blue #1E3A8A
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setFillColor(37, 99, 235); // Accent cyan/blue strip
  doc.rect(0, 75, pageWidth, 4, 'F');

  // App Title & Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('CampusFix AI', 36, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(219, 234, 254);
  doc.text('Smart Campus Infrastructure & Maintenance Management', 36, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL ISSUE HISTORY TRANSCRIPT', pageWidth - 36, 42, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth - 36, 58, { align: 'right' });

  // 2. Student Info Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, 95, pageWidth - 72, 60, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STUDENT RECORD:', 48, 114);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const studentName = user?.name || reports[0]?.reporterName || 'Student';
  const studentEmail = user?.email || reports[0]?.reporterEmail || 'N/A';
  const studentRoll = user?.rollNumber || 'N/A';
  const studentDept = user?.department || 'General Campus';

  doc.text(`Name: `, 48, 130);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(studentName, 85, 130);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Roll / ID: `, 48, 144);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(studentRoll, 95, 144);

  const midX = pageWidth / 2 + 20;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Department: `, midX, 130);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(studentDept, midX + 65, 130);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: `, midX, 144);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(studentEmail, midX + 38, 144);

  // 3. Quick Metrics Row
  const total = reports.length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const inProgress = reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const pending = reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;

  const cardWidth = (pageWidth - 72 - 30) / 4;
  const cardY = 168;

  const metrics = [
    { label: 'Total Filed', count: total, color: [241, 245, 249], text: [15, 23, 42] },
    { label: 'Resolved', count: resolved, color: [236, 253, 245], text: [5, 150, 105] },
    { label: 'In Progress', count: inProgress, color: [239, 246, 255], text: [37, 99, 235] },
    { label: 'Pending / Review', count: pending, color: [254, 243, 199], text: [217, 119, 6] }
  ];

  metrics.forEach((m, idx) => {
    const x = 36 + idx * (cardWidth + 10);
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.roundedRect(x, cardY, cardWidth, 38, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(m.text[0], m.text[1], m.text[2]);
    doc.text(String(m.count), x + cardWidth / 2, cardY + 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + cardWidth / 2, cardY + 32, { align: 'center' });
  });

  // 4. Reports Table
  const tableData = reports.map((r, i) => [
    r.id,
    new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
    r.title,
    r.category,
    r.location,
    r.priority,
    r.status
  ]);

  autoTable(doc, {
    startY: 218,
    head: [['ID', 'Date', 'Issue Title', 'Category', 'Location', 'Priority', 'Status']],
    body: tableData,
    margin: { left: 36, right: 36, bottom: 45 },
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 65 },
      4: { cellWidth: 85 },
      5: { cellWidth: 50, fontStyle: 'bold' },
      6: { cellWidth: 65, fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Highlight Status column
      if (data.section === 'body' && data.column.index === 6) {
        const val = String(data.cell.raw);
        if (val === 'Resolved') {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (val === 'In Progress' || val === 'Assigned') {
          data.cell.styles.textColor = [37, 99, 235];
        } else if (val === 'Pending' || val === 'Under Review') {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (val === 'Rejected') {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
      // Highlight Priority column
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw);
        if (val === 'Urgent') {
          data.cell.styles.textColor = [225, 29, 72];
        } else if (val === 'High') {
          data.cell.styles.textColor = [234, 88, 12];
        }
      }
    }
  });

  // 5. Page Numbering & Official Verification Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(36, pageHeight - 30, pageWidth - 36, pageHeight - 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'CampusFix AI System Transcript • Official Student Issue Verification Record',
      36,
      pageHeight - 18
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 36, pageHeight - 18, { align: 'right' });
  }

  // Save the document
  const fileDate = new Date().toISOString().split('T')[0];
  const studentPrefix = user?.rollNumber ? `_${user.rollNumber}` : '';
  doc.save(`CampusFix_Report_History${studentPrefix}_${fileDate}.pdf`);
}
