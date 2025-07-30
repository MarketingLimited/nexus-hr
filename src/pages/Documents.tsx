import { FileText, Plus, Search, Filter, Download, Upload, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground">Organize and manage HR documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-green-600">+34 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
            <p className="text-xs text-muted-foreground">Of 10 GB limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shared Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">12.5% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Documents this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Employee Files", count: 247, icon: "👥", color: "bg-employees/10 text-employees" },
          { name: "Policies", count: 45, icon: "📋", color: "bg-leaves/10 text-leaves" },
          { name: "Contracts", count: 123, icon: "📄", color: "bg-payroll/10 text-payroll" },
          { name: "Training Materials", count: 89, icon: "🎓", color: "bg-performance/10 text-performance" },
        ].map((category, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center text-lg`}>
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.count} documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search documents..." 
                className="w-full"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              {
                name: "Employee Handbook 2024.pdf",
                category: "Policies",
                size: "2.4 MB",
                modified: "2 hours ago",
                modifiedBy: "HR Admin",
                type: "pdf"
              },
              {
                name: "Sarah Johnson - Employment Contract.docx",
                category: "Contracts",
                size: "156 KB",
                modified: "1 day ago",
                modifiedBy: "John Smith",
                type: "docx"
              },
              {
                name: "Onboarding Checklist Template.xlsx",
                category: "Templates",
                size: "45 KB",
                modified: "3 days ago",
                modifiedBy: "Emma Davis",
                type: "xlsx"
              },
              {
                name: "Performance Review Guidelines.pdf",
                category: "Policies",
                size: "890 KB",
                modified: "1 week ago",
                modifiedBy: "HR Admin",
                type: "pdf"
              },
              {
                name: "Team Building Workshop Presentation.pptx",
                category: "Training",
                size: "12.3 MB",
                modified: "2 weeks ago",
                modifiedBy: "Mike Chen",
                type: "pptx"
              }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.category} • {doc.size} • Modified {doc.modified} by {doc.modifiedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
            <Button variant="outline">Choose Files</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;