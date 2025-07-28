
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

export function StudentDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Continue your learning journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Assignments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Courses</CardTitle>
            <CardDescription>Your active learning courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'English Grammar Fundamentals', progress: 75, status: 'In Progress' },
              { name: 'Business English', progress: 45, status: 'In Progress' },
              { name: 'Conversation Practice', progress: 90, status: 'Almost Complete' },
              { name: 'Academic Writing', progress: 20, status: 'Just Started' }
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{course.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  {course.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Don't miss these deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Essay on Shakespeare', course: 'English Literature', due: 'Tomorrow', priority: 'high' },
              { title: 'Grammar Exercise 5', course: 'Grammar Fundamentals', due: '3 days', priority: 'medium' },
              { title: 'Speaking Assessment', course: 'Conversation Practice', due: '1 week', priority: 'low' }
            ].map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{assignment.title}</h4>
                  <p className="text-sm text-muted-foreground">{assignment.course}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={assignment.priority === 'high' ? 'destructive' : 
                             assignment.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    Due {assignment.due}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do today?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              Continue Learning
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              View Schedule
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              Submit Assignment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}