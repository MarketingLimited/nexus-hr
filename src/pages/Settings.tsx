import { Settings as SettingsIcon, Users, Shield, Bell, Database, Globe, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  useSystemSettings, 
  useUpdateSystemSettings,
  useSecuritySettings,
  useUpdateSecuritySettings,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useBackupSettings,
  useUpdateBackupSettings,
  useResetSettings,
  useExportAuditLog,
  useTestApiConnections,
  useCreateBackup,
  useExportData
} from "@/hooks/useSettings";
import { useSecurityMetrics } from "@/hooks/useSecurity";
import { useSystemHealth } from "@/hooks/useMonitoring";
import { useState } from "react";

const Settings = () => {
  const [formData, setFormData] = useState<any>({});

  // Data hooks
  const { data: systemSettings, isLoading: systemLoading } = useSystemSettings();
  const { data: securitySettings, isLoading: securityLoading } = useSecuritySettings();
  const { data: notificationSettings, isLoading: notificationLoading } = useNotificationSettings();
  const { data: backupSettings, isLoading: backupLoading } = useBackupSettings();
  const { data: securityMetrics } = useSecurityMetrics();
  const { data: systemHealth } = useSystemHealth();

  // Mutation hooks
  const updateSystemSettings = useUpdateSystemSettings();
  const updateSecuritySettings = useUpdateSecuritySettings();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const updateBackupSettings = useUpdateBackupSettings();
  const resetSettings = useResetSettings();
  const exportAuditLog = useExportAuditLog();
  const testConnections = useTestApiConnections();
  const createBackup = useCreateBackup();
  const exportData = useExportData();

  const isLoading = systemLoading || securityLoading || notificationLoading || backupLoading;

  const handleSaveChanges = () => {
    if (formData.system) updateSystemSettings.mutate(formData.system);
    if (formData.security) updateSecuritySettings.mutate(formData.security);
    if (formData.notifications) updateNotificationSettings.mutate(formData.notifications);
    if (formData.backup) updateBackupSettings.mutate(formData.backup);
    setFormData({});
  };

  const updateField = (category: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure your HRM system preferences</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={formData.system?.companyName ?? systemSettings?.companyName ?? ''}
                onChange={(e) => updateField('system', 'companyName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Input 
                id="timezone" 
                value={formData.system?.timezone ?? systemSettings?.timezone ?? ''}
                onChange={(e) => updateField('system', 'timezone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input 
                id="currency" 
                value={formData.system?.currency ?? systemSettings?.currency ?? ''}
                onChange={(e) => updateField('system', 'currency', e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Enable dark theme</p>
              </div>
              <Switch 
                checked={formData.system?.darkMode ?? systemSettings?.darkMode ?? false}
                onCheckedChange={(checked) => updateField('system', 'darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save</p>
                <p className="text-sm text-muted-foreground">Automatically save form data</p>
              </div>
              <Switch 
                checked={formData.system?.autoSave ?? systemSettings?.autoSave ?? true}
                onCheckedChange={(checked) => updateField('system', 'autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default User Role</Label>
              <Input 
                value={formData.system?.defaultUserRole ?? systemSettings?.defaultUserRole ?? ''}
                onChange={(e) => updateField('system', 'defaultUserRole', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password Requirements</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Minimum 8 characters</span>
                  <Switch 
                    checked={(formData.system?.passwordMinLength ?? systemSettings?.passwordMinLength ?? 8) >= 8}
                    onCheckedChange={(checked) => updateField('system', 'passwordMinLength', checked ? 8 : 6)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require special characters</span>
                  <Switch 
                    checked={formData.system?.requireSpecialChars ?? systemSettings?.requireSpecialChars ?? true}
                    onCheckedChange={(checked) => updateField('system', 'requireSpecialChars', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require numbers</span>
                  <Switch 
                    checked={formData.system?.requireNumbers ?? systemSettings?.requireNumbers ?? true}
                    onCheckedChange={(checked) => updateField('system', 'requireNumbers', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Registration</p>
                <p className="text-sm text-muted-foreground">Allow new user registration</p>
              </div>
              <Switch 
                checked={formData.system?.userRegistration ?? systemSettings?.userRegistration ?? false}
                onCheckedChange={(checked) => updateField('system', 'userRegistration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input 
                type="number"
                value={formData.security?.sessionTimeout ?? securitySettings?.sessionTimeout ?? 60}
                onChange={(e) => updateField('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
              </div>
              <Switch 
                checked={formData.security?.twoFactorAuth ?? securitySettings?.twoFactorAuth ?? false}
                onCheckedChange={(checked) => updateField('security', 'twoFactorAuth', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Attempt Limit</p>
                <p className="text-sm text-muted-foreground">Block after 5 failed attempts</p>
              </div>
              <Switch 
                checked={(formData.security?.loginAttemptLimit ?? securitySettings?.loginAttemptLimit ?? 5) > 0}
                onCheckedChange={(checked) => updateField('security', 'loginAttemptLimit', checked ? 5 : 0)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Encryption</p>
                <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
              </div>
              <Switch 
                checked={formData.security?.dataEncryption ?? securitySettings?.dataEncryption ?? true}
                onCheckedChange={(checked) => updateField('security', 'dataEncryption', checked)}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => exportAuditLog.mutate()}
                disabled={exportAuditLog.isPending}
              >
                {exportAuditLog.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Export Security Audit Log
              </Button>
              {securityMetrics && (
                <div className="text-sm text-muted-foreground">
                  {securityMetrics.totalEvents} events recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Leave requests, approvals</p>
                </div>
                <Switch 
                  checked={formData.notifications?.emailNotifications ?? notificationSettings?.emailNotifications ?? true}
                  onCheckedChange={(checked) => updateField('notifications', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Urgent alerts only</p>
                </div>
                <Switch 
                  checked={formData.notifications?.smsNotifications ?? notificationSettings?.smsNotifications ?? false}
                  onCheckedChange={(checked) => updateField('notifications', 'smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Real-time updates</p>
                </div>
                <Switch 
                  checked={formData.notifications?.pushNotifications ?? notificationSettings?.pushNotifications ?? true}
                  onCheckedChange={(checked) => updateField('notifications', 'pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Automated weekly summaries</p>
                </div>
                <Switch 
                  checked={formData.notifications?.weeklyReports ?? notificationSettings?.weeklyReports ?? true}
                  onCheckedChange={(checked) => updateField('notifications', 'weeklyReports', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input 
                type="email"
                value={formData.notifications?.notificationEmail ?? notificationSettings?.notificationEmail ?? ''}
                onChange={(e) => updateField('notifications', 'notificationEmail', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Directory Sync</p>
                  <p className="text-sm text-muted-foreground">Sync with AD users</p>
                </div>
                <Switch 
                  checked={formData.system?.activeDirectorySync ?? systemSettings?.activeDirectorySync ?? false}
                  onCheckedChange={(checked) => updateField('system', 'activeDirectorySync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">Send notifications to Slack</p>
                </div>
                <Switch 
                  checked={formData.system?.slackIntegration ?? systemSettings?.slackIntegration ?? false}
                  onCheckedChange={(checked) => updateField('system', 'slackIntegration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-muted-foreground">Sync leave calendar</p>
                </div>
                <Switch 
                  checked={formData.system?.googleCalendar ?? systemSettings?.googleCalendar ?? false}
                  onCheckedChange={(checked) => updateField('system', 'googleCalendar', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payroll System API</p>
                  <p className="text-sm text-muted-foreground">External payroll integration</p>
                </div>
                <Switch 
                  checked={formData.system?.payrollSystemApi ?? systemSettings?.payrollSystemApi ?? false}
                  onCheckedChange={(checked) => updateField('system', 'payrollSystemApi', checked)}
                />
              </div>
            </div>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => testConnections.mutate()}
              disabled={testConnections.isPending}
            >
              {testConnections.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Test API Connections
            </Button>
          </CardContent>
        </Card>

        {/* Backup & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-muted-foreground">Daily backup at 2:00 AM</p>
              </div>
              <Switch 
                checked={formData.backup?.automaticBackups ?? backupSettings?.automaticBackups ?? true}
                onCheckedChange={(checked) => updateField('backup', 'automaticBackups', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Backup Retention (days)</Label>
              <Input 
                type="number"
                value={formData.backup?.backupRetention ?? backupSettings?.backupRetention ?? 30}
                onChange={(e) => updateField('backup', 'backupRetention', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Export Format</Label>
              <Input 
                value={formData.system?.dataExportFormat ?? systemSettings?.dataExportFormat ?? 'CSV, JSON'}
                onChange={(e) => updateField('system', 'dataExportFormat', e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => createBackup.mutate()}
                disabled={createBackup.isPending}
              >
                {createBackup.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Backup
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => exportData.mutate('csv')}
                disabled={exportData.isPending}
              >
                {exportData.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Export Data
              </Button>
            </div>

            {systemHealth && (
              <div className="text-sm text-muted-foreground">
                System Health: {systemHealth.data?.status}
              </div>
            )}

            <Button variant="destructive" className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={() => resetSettings.mutate()}
          disabled={resetSettings.isPending}
        >
          {resetSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveChanges}
          disabled={Object.keys(formData).length === 0 || updateSystemSettings.isPending}
        >
          {updateSystemSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;