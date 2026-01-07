/**
 * Export Utilities
 * Functions for exporting data to various formats (CSV, PDF, etc.)
 */

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  filename: string,
  headers?: string[]
): void {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(","),
    // Data rows
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Handle nested objects and arrays
          if (value === null || value === undefined) return "";
          if (typeof value === "object") {
            return JSON.stringify(value);
          }
          // Escape commas and quotes
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export maintenance analytics to CSV
 */
export function exportMaintenanceAnalytics(
  statistics: any,
  filename: string = "maintenance-analytics"
): void {
  const data: any[] = [];

  // Add summary metrics
  data.push({
    Metric: "Total Requests",
    Value: statistics.total_requests || 0,
  });
  data.push({
    Metric: "Open Requests",
    Value: statistics.open_requests || 0,
  });
  data.push({
    Metric: "Resolved Requests",
    Value: statistics.resolved_requests || 0,
  });
  data.push({
    Metric: "Average Resolution Time",
    Value: statistics.average_resolution_time || 0,
  });
  data.push({
    Metric: "Total Cost",
    Value: statistics.total_cost || 0,
  });
  data.push({
    Metric: "Average Cost",
    Value: statistics.average_cost || 0,
  });

  // Add status breakdown
  if (statistics.by_status) {
    Object.entries(statistics.by_status).forEach(([status, count]) => {
      data.push({
        Metric: `Status: ${status}`,
        Value: count,
      });
    });
  }

  // Add priority breakdown
  if (statistics.by_priority) {
    Object.entries(statistics.by_priority).forEach(([priority, count]) => {
      data.push({
        Metric: `Priority: ${priority}`,
        Value: count,
      });
    });
  }

  // Add SLA compliance
  if (statistics.sla_compliance) {
    data.push({
      Metric: "Response SLA Rate",
      Value: `${statistics.sla_compliance.response_rate || 0}%`,
    });
    data.push({
      Metric: "Assignment SLA Rate",
      Value: `${statistics.sla_compliance.assignment_rate || 0}%`,
    });
    data.push({
      Metric: "Completion SLA Rate",
      Value: `${statistics.sla_compliance.completion_rate || 0}%`,
    });
  }

  exportToCSV(data, filename, ["Metric", "Value"]);
}

/**
 * Export artisan performance to CSV
 */
export function exportArtisanPerformance(
  artisans: any[],
  filename: string = "artisan-performance"
): void {
  const data = artisans.map((artisan) => ({
    Name: artisan.name,
    Type: artisan.type,
    "Total Requests": artisan.total_requests || 0,
    "Completed Requests": artisan.completed_requests || 0,
    "In Progress": artisan.in_progress_requests || 0,
    "Average Rating": artisan.average_rating?.toFixed(2) || "N/A",
    "Total Ratings": artisan.total_ratings || 0,
    "Completion Rate (%)": artisan.completion_rate?.toFixed(2) || 0,
    "Average Completion Time (hours)": artisan.average_completion_time?.toFixed(2) || "N/A",
    "On-Time Rate (%)": artisan.on_time_completion_rate?.toFixed(2) || 0,
    "Rework Rate (%)": artisan.rework_rate?.toFixed(2) || 0,
    "Average Cost": artisan.average_cost_per_request || 0,
    "Specializations": artisan.specializations?.join("; ") || "",
    Status: artisan.is_active ? "Active" : "Inactive",
    Blacklisted: artisan.is_blacklisted ? "Yes" : "No",
  }));

  exportToCSV(data, filename);
}

/**
 * Format date for filename
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

