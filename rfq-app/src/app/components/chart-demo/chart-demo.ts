import { Component } from '@angular/core';

@Component({
  selector: 'app-chart-demo',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Admin Dashboard - Charts Implementation Preview
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            This demonstrates the chart implementation for RFQ status distribution and submission timeline
          </p>
        </div>

        <!-- Charts Section Placeholder -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Status Distribution Pie Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                📊 Status Distribution
              </h3>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                  <div class="text-4xl mb-4">🥧</div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pie Chart Component</h4>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">Status Distribution Visualization</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        Pending Review
                      </span>
                      <span>45 (37.5%)</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Approved
                      </span>
                      <span>32 (26.7%)</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Rejected
                      </span>
                      <span>28 (23.3%)</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Completed
                      </span>
                      <span>15 (12.5%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submissions Timeline Line Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                📈 Submissions Timeline
              </h3>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                  <div class="text-4xl mb-4">📊</div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Line Chart Component</h4>
                  <p class="text-gray-600 dark:text-gray-400 mb-4">RFQ Submissions Over Time</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        RFQ Submissions
                      </span>
                      <span>Trend Line</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="flex items-center">
                        <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Completion Rate
                      </span>
                      <span>Success %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Implementation Features -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              ✅ Implementation Features
            </h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">Backend (C# .NET API)</h4>
                <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>✅ StatusDistributionData & SubmissionTimelineData DTOs</li>
                  <li>✅ SubmissionStatusDistributionQuery handler</li>
                  <li>✅ SubmissionTimelineQuery handler</li>
                  <li>✅ Admin-only API endpoints:</li>
                  <li class="ml-4">• GET /api/v1/Submission/charts/status-distribution</li>
                  <li class="ml-4">• GET /api/v1/Submission/charts/timeline?daysBack=30</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">Frontend (Angular + Chart.js)</h4>
                <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>✅ Chart.js and ng2-charts installed</li>
                  <li>✅ Reusable PieChartComponent</li>
                  <li>✅ Reusable LineChartComponent</li>
                  <li>✅ Updated RfqService with chart API methods</li>
                  <li>✅ Chart data models in rfq.model.ts</li>
                  <li>✅ Admin-only chart visibility in vendor-rfqs component</li>
                  <li>✅ SharedModule exports chart components</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards (for context) -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              120
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Total RFQs
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              45
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              32
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Approved
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              28
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Rejected
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              15
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              8
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Last 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChartDemoComponent {
}