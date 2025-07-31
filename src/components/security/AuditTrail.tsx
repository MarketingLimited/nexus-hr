import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSecurityEvents } from "@/hooks/useSecurity"
import { Search, Filter, Download, Eye, Clock, MapPin, User } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export const AuditTrail = () => {
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    userId: '',
    search: ''
  })

  const { data: eventsResponse } = useSecurityEvents({
    type: filters.type || undefined,
    severity: filters.severity || undefined,
    userId: filters.userId || undefined,
    page: 1,
    limit: 50
  })

  const events = eventsResponse?.data || []

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login_success': return '✅'
      case 'login_failed': return '❌'
      case 'password_change': return '🔑'
      case 'role_change': return '👤'
      case 'permission_change': return '🔒'
      case 'suspicious_activity': return '⚠️'
      default: return '📝'
    }
  }

  const filteredEvents = events.filter(event => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        event.userEmail.toLowerCase().includes(searchTerm) ||
        event.type.toLowerCase().includes(searchTerm) ||
        event.ip.toLowerCase().includes(searchTerm) ||
        (event.location && event.location.toLowerCase().includes(searchTerm))
      )
    }
    return true
  })

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'User', 'IP Address', 'Location', 'Severity', 'Details'].join(','),
      ...filteredEvents.map(event => [
        format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        event.type,
        event.userEmail,
        event.ip,
        event.location || 'Unknown',
        event.severity,
        JSON.stringify(event.details)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_trail_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground">Complete security event history and forensic analysis</p>
        </div>
        <Button onClick={exportAuditLog} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>Filter security events by type, severity, or user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="login_success">Login Success</SelectItem>
                  <SelectItem value="login_failed">Login Failed</SelectItem>
                  <SelectItem value="password_change">Password Change</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                  <SelectItem value="permission_change">Permission Change</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Security Events ({filteredEvents.length})</span>
            <Badge variant="outline">{eventsResponse?.meta?.total || 0} total events</Badge>
          </CardTitle>
          <CardDescription>Chronological list of all security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                        <span className="font-medium">
                          {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{event.userEmail}</div>
                          <div className="text-xs text-muted-foreground">ID: {event.userId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.timestamp))} ago
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{event.location || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{event.ip}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {Object.entries(event.details).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No security events found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}