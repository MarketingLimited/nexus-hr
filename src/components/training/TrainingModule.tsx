import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Award,
  Users,
  Star,
  FileText,
  Video,
  Headphones,
  Download,
  ExternalLink,
  Target,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: 'mandatory' | 'skills' | 'compliance' | 'leadership' | 'technical';
  type: 'video' | 'interactive' | 'document' | 'assessment' | 'webinar';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  progress: number; // 0-100
  dueDate?: string;
  completedDate?: string;
  instructor?: string;
  rating: number;
  enrolledCount: number;
  certificateAvailable: boolean;
  tags: string[];
}

interface TrainingAssignment {
  id: string;
  employeeId: string;
  courseId: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completionStatus: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

interface TrainingProgress {
  courseId: string;
  currentModule: number;
  totalModules: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  quiz_scores: number[];
  certificateEarned?: string;
}

export const TrainingModule: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentlyWatching, setCurrentlyWatching] = useState<string | null>(null);

  // Mock data
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([
    {
      id: 'safety-101',
      title: 'Workplace Safety Fundamentals',
      description: 'Essential safety protocols and emergency procedures for all employees',
      category: 'mandatory',
      type: 'video',
      duration: 45,
      difficulty: 'beginner',
      status: 'completed',
      progress: 100,
      dueDate: '2024-01-31',
      completedDate: '2024-01-15',
      instructor: 'Safety Team',
      rating: 4.5,
      enrolledCount: 1247,
      certificateAvailable: true,
      tags: ['safety', 'mandatory', 'workplace']
    },
    {
      id: 'data-protection',
      title: 'Data Protection & Privacy (GDPR)',
      description: 'Understanding data protection laws and company privacy policies',
      category: 'compliance',
      type: 'interactive',
      duration: 60,
      difficulty: 'intermediate',
      status: 'in-progress',
      progress: 65,
      dueDate: '2024-02-15',
      instructor: 'Legal Team',
      rating: 4.2,
      enrolledCount: 892,
      certificateAvailable: true,
      tags: ['gdpr', 'privacy', 'compliance']
    },
    {
      id: 'leadership-basics',
      title: 'Leadership Development Program',
      description: 'Core leadership skills and team management fundamentals',
      category: 'leadership',
      type: 'webinar',
      duration: 120,
      difficulty: 'intermediate',
      status: 'not-started',
      progress: 0,
      instructor: 'John Smith, Leadership Coach',
      rating: 4.8,
      enrolledCount: 324,
      certificateAvailable: true,
      tags: ['leadership', 'management', 'development']
    },
    {
      id: 'react-advanced',
      title: 'Advanced React Development',
      description: 'Deep dive into React hooks, context, and performance optimization',
      category: 'technical',
      type: 'video',
      duration: 180,
      difficulty: 'advanced',
      prerequisites: ['react-basics', 'javascript-es6'],
      status: 'not-started',
      progress: 0,
      instructor: 'Sarah Developer',
      rating: 4.7,
      enrolledCount: 156,
      certificateAvailable: true,
      tags: ['react', 'frontend', 'development']
    }
  ]);

  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([
    {
      courseId: 'data-protection',
      currentModule: 4,
      totalModules: 6,
      timeSpent: 39,
      lastAccessed: '2024-01-18T14:30:00Z',
      quiz_scores: [85, 92, 78],
    }
  ]);

  const getStatusColor = (status: TrainingCourse['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: TrainingCourse['category']) => {
    switch (category) {
      case 'mandatory': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      case 'skills': return 'bg-blue-100 text-blue-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: TrainingCourse['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'assessment': return <CheckCircle className="w-4 h-4" />;
      case 'webinar': return <Users className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const startCourse = (courseId: string) => {
    setTrainingCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, status: 'in-progress' as const, progress: course.progress || 1 }
          : course
      )
    );
    
    setCurrentlyWatching(courseId);
    
    toast({
      title: "Course Started",
      description: "You've started the training course.",
    });
  };

  const continueCourse = (courseId: string) => {
    setCurrentlyWatching(courseId);
    
    toast({
      title: "Resuming Course",
      description: "Continuing from where you left off.",
    });
  };

  const completeCourse = (courseId: string) => {
    setTrainingCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { 
              ...course, 
              status: 'completed' as const, 
              progress: 100,
              completedDate: new Date().toISOString().split('T')[0]
            }
          : course
      )
    );
    
    setCurrentlyWatching(null);
    
    toast({
      title: "Course Completed! 🎉",
      description: "Congratulations! You've completed the training course.",
    });
  };

  const downloadCertificate = (courseId: string) => {
    toast({
      title: "Certificate Downloaded",
      description: "Your completion certificate has been downloaded.",
    });
  };

  const filteredCourses = trainingCourses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

  const getProgressData = (courseId: string) => {
    return trainingProgress.find(p => p.courseId === courseId);
  };

  const stats = {
    totalCourses: trainingCourses.length,
    completed: trainingCourses.filter(c => c.status === 'completed').length,
    inProgress: trainingCourses.filter(c => c.status === 'in-progress').length,
    totalHours: trainingCourses.reduce((sum, c) => sum + (c.status === 'completed' ? c.duration : 0), 0) / 60,
    certificatesEarned: trainingCourses.filter(c => c.status === 'completed' && c.certificateAvailable).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Training & Development</h2>
          <p className="text-muted-foreground">Complete training courses and track your professional development</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Training
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            My Certificates
          </Button>
        </div>
      </div>

      {/* Training Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Hours Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.certificatesEarned}</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* My Courses */}
        <TabsContent value="my-courses" className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {['mandatory', 'compliance', 'skills', 'leadership', 'technical'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progressData = getProgressData(course.id);
              
              return (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(course.type)}
                        <span className="text-xs text-muted-foreground">{course.duration}min</span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="w-full" />
                    </div>

                    {/* Course Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Difficulty:</span>
                        <div className="capitalize font-medium">{course.difficulty}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Details */}
                    {progressData && (
                      <div className="text-xs text-muted-foreground">
                        Module {progressData.currentModule} of {progressData.totalModules} • 
                        {progressData.timeSpent}min spent
                      </div>
                    )}

                    {/* Status Badge */}
                    <Badge className={getStatusColor(course.status)}>
                      {course.status.replace('-', ' ').toUpperCase()}
                    </Badge>

                    {/* Due Date Warning */}
                    {course.dueDate && course.status !== 'completed' && (
                      <div className="text-xs text-orange-600">
                        Due: {course.dueDate}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {course.status === 'not-started' && (
                        <Button 
                          onClick={() => startCourse(course.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Course
                        </Button>
                      )}
                      
                      {course.status === 'in-progress' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => continueCourse(course.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Button>
                          <Button 
                            onClick={() => completeCourse(course.id)}
                            variant="outline"
                            size="sm"
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                      
                      {course.status === 'completed' && course.certificateAvailable && (
                        <Button 
                          onClick={() => downloadCertificate(course.id)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Download Certificate
                        </Button>
                      )}
                    </div>

                    {/* Instructor */}
                    {course.instructor && (
                      <div className="text-xs text-muted-foreground">
                        Instructor: {course.instructor}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Course Catalog */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Catalog Coming Soon</h3>
                <p className="text-muted-foreground">
                  Browse and enroll in additional training courses from our comprehensive catalog.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Training Assignments Coming Soon</h3>
                <p className="text-muted-foreground">
                  View mandatory training assignments and track completion deadlines.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Training Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed training progress analytics and learning insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Currently Watching */}
      {currentlyWatching && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-medium">Currently Learning</div>
                  <div className="text-sm text-muted-foreground">
                    {trainingCourses.find(c => c.id === currentlyWatching)?.title}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => setCurrentlyWatching(null)}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};