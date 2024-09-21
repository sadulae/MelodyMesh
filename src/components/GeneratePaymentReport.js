import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import './GeneratePaymentReport.css';

// Define the styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    marginBottom: 10,
    textAlign: 'center',
  },
  h1: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'left',
  },
  table: {
    display: 'table',
    width: '100%',
    margin: '10px 0',
    borderStyle: 'solid',
    borderColor: ' #000000',
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    padding: 8,
  },
  cellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: ' #000000',
    borderRightStyle: 'solid',
    padding: 10,
    textAlign: 'center',
  },
  cell: {
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: ' #000000',
    borderRightStyle: 'solid',
    padding: 5,
    textAlign: 'center',
  },
});


const GeneratePaymentReport = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [performer, setPerformer] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch payment data based on the selected date range and performer
  const fetchPaymentData = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch('http://localhost:5000/api/get-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          performer: performer,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false); // Set loading to false when fetching is done
    }
  };

  const generateReport = () => {
    fetchPaymentData();
  };

  // PDF Document Component
  const ReportDocument = ({ data }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
        <Text style={styles.title}>Melody-Mesh Event Managment</Text>
        <Text style={styles.title}>No 7/8,Salamal Road,Colombo 08.</Text>
        <Text style={styles.title}>Mobile Number - 0758877123/0765644331</Text>
        <Text style={styles.title}>_____________________________________________</Text>
        <Text style={styles.title}>                                             </Text>
        <Text style={styles.title}>                                             </Text>
        <Text style={styles.h1}>Payment Report</Text>
 
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Date</Text>
              <Text style={styles.cellHeader}>Description</Text>
              <Text style={styles.cellHeader}>Amount</Text>
            </View>
            {/* Table Rows */}
            {data.map((payment, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.cell}>{payment.date}</Text>
                <Text style={styles.cell}>{payment.description}</Text>
                <Text style={styles.cell}>{payment.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="generate-payment-report">
      <h1>Generate Payment Report</h1>
      <div className="report-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Band or Performer:</label>
          <input
            type="text"
            value={performer}
            onChange={(e) => setPerformer(e.target.value)}
          />
        </div>
        <button onClick={generateReport} disabled={loading}>
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>
      {reportData.length > 0 && (
        <div className="pdf-link">
          <PDFDownloadLink
            document={<ReportDocument data={reportData} />}
            fileName="payment-report.pdf"
          >
            {({ loading }) =>
              loading ? 'Preparing PDF...' : 'Download PDF Report'
            }
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default GeneratePaymentReport;
