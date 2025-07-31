import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Upload,
  Download,
  PenTool,
  Camera,
  Shield,
  Laptop,
  Key,
  BookOpen,
  Users,
  Calendar
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'signature' | 'training' | 'equipment' | 'verification' | 'meeting';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'optional';
  requiredBy?: string;
  estimatedTime: number; // in minutes
  dependencies?: string[];
  assignedTo?: string;
  documents?: DocumentRequirement[];
  autoComplete?: boolean;
}

interface DocumentRequirement {
  id: string;
  name: string;
  type: 'upload' | 'fill' | 'sign' | 'read';
  required: boolean;
  template?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  uploadedFile?: string;
  rejectionReason?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: 'hardware' | 'software' | 'access' | 'physical';
  status: 'pending' | 'assigned' | 'delivered' | 'returned';
  assignedDate?: string;
  serialNumber?: string;
  notes?: string;
}

export const DigitalOnboardingWorkflow: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('new-hire-001');
  
  // Mock onboarding workflow
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome & Overview',
      description: 'Introduction to company culture, values, and onboarding process',
      type: 'meeting',
      status: 'completed',
      estimatedTime: 30,
      assignedTo: 'hr-team'
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Complete personal details and emergency contacts',
      type: 'document',
      status: 'completed',
      estimatedTime: 15,
      documents: [
        {
          id: 'personal-form',
          name: 'Personal Information Form',
          type: 'fill',
          required: true,
          status: 'approved'
        },
        {
          id: 'emergency-contacts',
          name: 'Emergency Contact Form',
          type: 'fill',
          required: true,
          status: 'approved'
        }
      ]
    },
    {
      id: 'legal-docs',
      title: 'Legal Documentation',
      description: 'Review and sign employment contracts and legal documents',
      type: 'signature',
      status: 'in-progress',
      estimatedTime: 45,
      requiredBy: '2024-01-20',
      documents: [
        {
          id: 'employment-contract',
          name: 'Employment Contract',
          type: 'sign',
          required: true,
          status: 'pending'
        },
        {
          id: 'nda',
          name: 'Non-Disclosure Agreement',
          type: 'sign',
          required: true,
          status: 'submitted'
        },
        {
          id: 'handbook',
          name: 'Employee Handbook',
          type: 'read',
          required: true,
          status: 'pending'
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Verification',
      description: 'Identity verification and background check completion',
      type: 'verification',
      status: 'pending',
      estimatedTime: 20,
      dependencies: ['legal-docs'],
      documents: [
        {
          id: 'id-verification',
          name: 'Government ID',
          type: 'upload',
          required: true,
          status: 'pending'
        },
        {
          id: 'background-check',
          name: 'Background Check Consent',
          type: 'sign',
          required: true,
          status: 'pending'
        }
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Assignment',
      description: 'Receive and confirm receipt of work equipment',
      type: 'equipment',
      status: 'pending',
      estimatedTime: 30,
      dependencies: ['compliance']
    },
    {
      id: 'it-setup',
      title: 'IT Setup & Access',
      description: 'Account creation and system access provisioning',
      type: 'verification',
      status: 'pending',
      estimatedTime: 60,
      dependencies: ['equipment'],
      autoComplete: true
    },
    {
      id: 'training',
      title: 'Mandatory Training',
      description: 'Complete required training modules',
      type: 'training',
      status: 'pending',
      estimatedTime: 180,
      dependencies: ['it-setup']
    }
  ]);

  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([
    {
      id: 'laptop',
      name: 'MacBook Pro 16"',
      category: 'hardware',
      status: 'assigned',
      serialNumber: 'MBP2024001',
      assignedDate: '2024-01-15'
    },
    {
      id: 'monitor',
      name: 'Dell 27" Monitor',
      category: 'hardware',
      status: 'delivered',
      serialNumber: 'DEL27001'
    },
    {
      id: 'software',
      name: 'Office 365 License',
      category: 'software',
      status: 'assigned'
    },
    {
      id: 'badge',
      name: 'Employee ID Badge',
      category: 'physical',
      status: 'pending'
    },
    {
      id: 'parking',
      name: 'Parking Access Card',
      category: 'access',
      status: 'pending'
    }
  ]);

  const getStepIcon = (type: OnboardingStep['type'], status: OnboardingStep['status']) => {
    const baseClasses = "w-5 h-5";
    
    if (status === 'completed') {
      return <CheckCircle className={`${baseClasses} text-green-500`} />;
    }
    
    if (status === 'blocked') {
      return <AlertCircle className={`${baseClasses} text-red-500`} />;
    }

    switch (type) {
      case 'document':
        return <FileText className={`${baseClasses} text-blue-500`} />;
      case 'signature':
        return <PenTool className={`${baseClasses} text-purple-500`} />;
      case 'training':
        return <BookOpen className={`${baseClasses} text-orange-500`} />;
      case 'equipment':
        return <Laptop className={`${baseClasses} text-gray-500`} />;
      case 'verification':
        return <Shield className={`${baseClasses} text-indigo-500`} />;
      case 'meeting':
        return <Users className={`${baseClasses} text-pink-500`} />;
      default:
        return <Clock className={`${baseClasses} text-muted-foreground`} />;
    }
  };

  const getStatusBadge = (status: OnboardingStep['status']) => {
    const variants = {
      pending: 'secondary',
      'in-progress': 'default',
      completed: 'default',
      blocked: 'destructive',
      optional: 'outline'
    } as const;

    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
      optional: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status]}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const calculateProgress = () => {
    const completed = onboardingSteps.filter(step => step.status === 'completed').length;
    return Math.round((completed / onboardingSteps.length) * 100);
  };

  const getTotalEstimatedTime = () => {
    return onboardingSteps
      .filter(step => step.status !== 'completed')
      .reduce((total, step) => total + step.estimatedTime, 0);
  };

  const completeStep = (stepId: string) => {
    setOnboardingSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'completed' as const }
          : step
      )
    );
    
    setCompletedSteps(prev => [...prev, stepId]);
    
    toast({
      title: "Step Completed",
      description: "Onboarding step has been marked as completed.",
    });
  };

  const uploadDocument = (documentId: string) => {
    // Simulate document upload
    setOnboardingSteps(prev => 
      prev.map(step => ({
        ...step,
        documents: step.documents?.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'submitted' as const, uploadedFile: 'document.pdf' }
            : doc
        )
      }))
    );

    toast({
      title: "Document Uploaded",
      description: "Document has been uploaded successfully.",
    });
  };

  const signDocument = (documentId: string) => {
    // Simulate e-signature
    setOnboardingSteps(prev => 
      prev.map(step => ({
        ...step,
        documents: step.documents?.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'submitted' as const }
            : doc
        )
      }))
    );

    toast({
      title: "Document Signed",
      description: "Document has been digitally signed.",
    });
  };

  const progress = calculateProgress();
  const remainingTime = getTotalEstimatedTime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Digital Onboarding Workflow</h2>
          <p className="text-muted-foreground">Complete employee onboarding process</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {progress}% Complete
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {onboardingSteps.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {onboardingSteps.filter(s => s.status === 'in-progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(remainingTime / 60)}h
                </div>
                <div className="text-sm text-muted-foreground">Est. Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Onboarding Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.type, step.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {getStatusBadge(step.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.estimatedTime}min
                      </span>
                      {step.requiredBy && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {step.requiredBy}
                        </span>
                      )}
                      {step.assignedTo && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {step.assignedTo}
                        </span>
                      )}
                    </div>

                    {step.dependencies && step.dependencies.length > 0 && (
                      <div className="text-xs text-orange-600">
                        Requires: {step.dependencies.join(', ')}
                      </div>
                    )}

                    {/* Document Requirements */}
                    {step.documents && step.documents.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-xs text-muted-foreground">Required Documents:</Label>
                        {step.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                doc.status === 'approved' ? 'bg-green-500' :
                                doc.status === 'submitted' ? 'bg-blue-500' :
                                doc.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-sm">{doc.name}</span>
                              {doc.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                            </div>
                            
                            <div className="flex gap-1">
                              {doc.type === 'upload' && doc.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => uploadDocument(doc.id)}
                                >
                                  <Upload className="w-3 h-3" />
                                </Button>
                              )}
                              {doc.type === 'sign' && doc.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => signDocument(doc.id)}
                                >
                                  <PenTool className="w-3 h-3" />
                                </Button>
                              )}
                              {doc.uploadedFile && (
                                <Button size="sm" variant="ghost">
                                  <Download className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.status !== 'completed' && step.status !== 'blocked' && (
                      <Button 
                        size="sm" 
                        onClick={() => completeStep(step.id)}
                        className="w-full"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Equipment Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="w-5 h-5" />
              Equipment Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipmentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'delivered' ? 'bg-green-500' :
                    item.status === 'assigned' ? 'bg-blue-500' :
                    item.status === 'returned' ? 'bg-gray-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.category} {item.serialNumber && `• ${item.serialNumber}`}
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant={item.status === 'delivered' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Equipment Checklist</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="received" />
                  <Label htmlFor="received" className="text-sm">
                    All equipment received and working properly
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="setup" />
                  <Label htmlFor="setup" className="text-sm">
                    Initial setup and configuration completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="security" />
                  <Label htmlFor="security" className="text-sm">
                    Security protocols and access confirmed
                  </Label>
                </div>
              </div>
              
              <Textarea 
                placeholder="Additional notes or issues..."
                className="mt-3"
              />
              
              <Button className="w-full">
                Confirm Equipment Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Take ID Photo
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Reset Password
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};