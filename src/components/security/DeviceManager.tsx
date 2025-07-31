import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDeviceManagement } from "@/hooks/useSecurity"
import { Smartphone, Monitor, Tablet, Shield, ShieldCheck, X, Search, Clock, MapPin, Trash2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export const DeviceManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('current-user')
  const { devices, trustDevice, revokeDevice, bulkTrustDevices, bulkRevokeDevices } = useDeviceManagement(selectedUserId)
  const { toast } = useToast()

  const getDeviceIcon = (deviceInfo: any) => {
    const os = deviceInfo.os.toLowerCase()
    if (os.includes('iphone') || os.includes('android')) return Smartphone
    if (os.includes('ipad') || os.includes('tablet')) return Tablet
    return Monitor
  }

  const getDeviceTypeLabel = (deviceInfo: any) => {
    const os = deviceInfo.os.toLowerCase()
    if (os.includes('iphone') || os.includes('android')) return 'Mobile'
    if (os.includes('ipad') || os.includes('tablet')) return 'Tablet'
    return 'Desktop'
  }

  const filteredDevices = devices?.filter(device => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      device.deviceInfo.browser.toLowerCase().includes(searchLower) ||
      device.deviceInfo.os.toLowerCase().includes(searchLower) ||
      device.deviceHash.toLowerCase().includes(searchLower)
    )
  }) || []

  const trustedDevices = filteredDevices.filter(d => d.trusted)
  const untrustedDevices = filteredDevices.filter(d => !d.trusted)

  const handleTrustDevice = async (deviceId: string) => {
    try {
      await trustDevice.mutateAsync(deviceId)
      toast({
        title: "Device Trusted",
        description: "Device has been marked as trusted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trust device",
        variant: "destructive"
      })
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await revokeDevice.mutateAsync(deviceId)
      toast({
        title: "Device Revoked",
        description: "Device access has been revoked"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke device",
        variant: "destructive"
      })
    }
  }

  const handleBulkTrust = async () => {
    try {
      await bulkTrustDevices.mutateAsync(untrustedDevices.map(d => d.id))
      toast({
        title: "Devices Trusted",
        description: `${untrustedDevices.length} devices have been trusted`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trust devices",
        variant: "destructive"
      })
    }
  }

  const handleBulkRevoke = async () => {
    try {
      await bulkRevokeDevices.mutateAsync(trustedDevices.map(d => d.id))
      toast({
        title: "Devices Revoked",
        description: `${trustedDevices.length} devices have been revoked`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke devices",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Device Manager</h2>
          <p className="text-muted-foreground">Manage device fingerprints and access control</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {trustedDevices.length} Trusted
          </Badge>
          <Badge variant="secondary">
            {untrustedDevices.length} Untrusted
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Device Search</CardTitle>
          <CardDescription>Search and filter registered devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices by browser, OS, or device hash..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleBulkTrust}
                disabled={untrustedDevices.length === 0 || bulkTrustDevices.isPending}
              >
                Trust All Untrusted
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkRevoke}
                disabled={trustedDevices.length === 0 || bulkRevokeDevices.isPending}
              >
                Revoke All Trusted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.deviceInfo)
          return (
            <Card key={device.id} className={`relative ${device.trusted ? 'border-primary' : 'border-muted'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{getDeviceTypeLabel(device.deviceInfo)}</CardTitle>
                  </div>
                  <Badge variant={device.trusted ? 'default' : 'secondary'}>
                    {device.trusted ? (
                      <div className="flex items-center space-x-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Trusted</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Untrusted</span>
                      </div>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Browser:</strong> {device.deviceInfo.browser}
                  </div>
                  <div className="text-sm">
                    <strong>OS:</strong> {device.deviceInfo.os}
                  </div>
                  <div className="text-sm">
                    <strong>Screen:</strong> {device.deviceInfo.screen}
                  </div>
                  <div className="text-sm">
                    <strong>Timezone:</strong> {device.deviceInfo.timezone}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>First seen: {format(new Date(device.firstSeen), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last seen: {formatDistanceToNow(new Date(device.lastSeen))} ago</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs text-muted-foreground mb-2">Device Hash:</div>
                  <div className="text-xs font-mono bg-muted p-2 rounded text-center">
                    {device.deviceHash}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {device.trusted ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRevokeDevice(device.id)}
                      disabled={revokeDevice.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Revoke Trust
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTrustDevice(device.id)}
                      disabled={trustDevice.isPending}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Trust Device
                    </Button>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Device</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to permanently delete this device? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">Cancel</Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeDevice(device.id)}
                        >
                          Delete Device
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredDevices.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No devices match your search criteria' : 'No registered devices for this user'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}