import { defineAction } from 'sanity'
import { BarChart3 } from 'lucide-react'

export const refreshAnalyticsAction = defineAction({
  name: 'refreshAnalytics',
  title: 'Refresh Analytics',
  icon: BarChart3,
  description: 'Update analytics data from live system',
  onHandle: async (context) => {
    const { client } = context

    try {
      // Call the analytics API to generate fresh data
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh analytics')
      }

      const result = await response.json()
      
      // Show success message
      context.toast.push({
        status: 'success',
        title: 'Analytics Updated',
        description: `Analytics data refreshed successfully. Revenue: KES ${result.totalRevenue?.toLocaleString() || 0}`,
      })

      // Refresh the document list
      context.documentStore.listenQuery('*[_type == "masterclassAnalytics"]')

    } catch (error) {
      console.error('Error refreshing analytics:', error)
      
      context.toast.push({
        status: 'error',
        title: 'Analytics Update Failed',
        description: error.message || 'Failed to refresh analytics data',
      })
    }
  },
})

export const refreshPerformanceAction = defineAction({
  name: 'refreshPerformance',
  title: 'Refresh Performance',
  icon: BarChart3,
  description: 'Update performance monitoring data',
  onHandle: async (context) => {
    const { client } = context

    try {
      // Call the performance API to generate fresh data
      const response = await fetch('/api/admin/performance', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh performance data')
      }

      const result = await response.json()
      
      // Show success message
      context.toast.push({
        status: 'success',
        title: 'Performance Data Updated',
        description: `Performance monitoring refreshed. Status: ${result.systemHealth?.status || 'unknown'}`,
      })

      // Refresh the document list
      context.documentStore.listenQuery('*[_type == "performanceMonitoring"]')

    } catch (error) {
      console.error('Error refreshing performance data:', error)
      
      context.toast.push({
        status: 'error',
        title: 'Performance Update Failed',
        description: error.message || 'Failed to refresh performance data',
      })
    }
  },
})
